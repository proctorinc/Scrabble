"use client";

import {
  useCallback,
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cva } from "class-variance-authority";
import { ValidationMarker, ValidationTone } from "@/types/game";
import { useGame } from "@/context/game-context";
import { BoardCell } from "@/components/board/board-cell";
import { cn } from "@/lib/utils";

const BOARD_SIZE = 650;
const COMPACT_BREAKPOINT = 640;
const DOUBLE_TAP_DELAY_MS = 280;
const TOUCH_DOUBLE_CLICK_SUPPRESSION_MS = 450;
// Tune the compact-screen double-tap zoom amount here.
const COMPACT_DOUBLE_TAP_ZOOM_SCALE = 1.5;
const COMPACT_ZOOMED_OUT_SIDE_PADDING = 12;
const BOARD_ZOOM_TRANSITION_MS = 220;

const boardVariants = cva(
  "relative aspect-square w-[650px] select-none rounded-[20px] border-2 border-border bg-board p-3 shadow-[var(--shadow-brutal-md)] sm:p-3",
);

const boardViewportVariants = cva(
  "w-full overscroll-contain pl-3 -pr-3 [touch-action:manipulation] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
);

type ZoomFocusTarget =
  | { type: "cell"; row: number; col: number }
  | { type: "point"; boardX: number; boardY: number };

function positionKey(row: number, col: number) {
  return `${row}-${col}`;
}

function getMarkerTone(markers: ValidationMarker[]): ValidationTone {
  return markers.some((marker) => marker.tone === "error")
    ? "error"
    : "success";
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    ? Boolean(target.closest("button, a, input, select, textarea, label"))
    : false;
}

export function Board({ className }: { className?: string }) {
  const { animationPhase, board, draftValidation, game } = useGame();
  const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  });
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [isZoomScrollEnabled, setIsZoomScrollEnabled] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const boardSurfaceRef = useRef<HTMLDivElement | null>(null);
  const previousDraftCountRef = useRef(game.draft.length);
  const previousTurnRef = useRef(game.turn);
  const lastTouchToggleRef = useRef(0);
  const lastTouchZoomAtRef = useRef(0);
  const pendingZoomFocusRef = useRef<ZoomFocusTarget | null>(null);
  const queuedZoomFrameRef = useRef<number | null>(null);
  const zoomTransitionTimeoutRef = useRef<number | null>(null);
  const pendingZoomOutCenterRef = useRef(false);

  const highlightByCell = useMemo(() => {
    const highlights = new Map<string, ValidationTone>();
    const marker = draftValidation?.markers[0];

    marker?.cells.forEach((cell) => {
      const key = positionKey(cell.row, cell.col);
      highlights.set(key, marker.tone);
    });

    return highlights;
  }, [draftValidation]);

  const markersByCell = useMemo(() => {
    const markers = new Map<string, ValidationMarker[]>();
    const marker = draftValidation?.markers[0];

    if (marker) {
      const key = positionKey(marker.anchor.row, marker.anchor.col);
      markers.set(key, [marker]);
    }

    return markers;
  }, [draftValidation]);
  const activeMarkerId =
    openMarkerId &&
    draftValidation?.markers.some((marker) => marker.id === openMarkerId)
      ? openMarkerId
      : null;
  const draftCount = game.draft.length;
  const { width: viewportWidth, height: viewportHeight } = viewportSize;
  const isCompactScreen = viewportWidth < COMPACT_BREAKPOINT;
  const fittedBoardWidth = isCompactScreen
    ? Math.max(0, viewportWidth - COMPACT_ZOOMED_OUT_SIDE_PADDING * 2)
    : viewportWidth;
  const fittedScale =
    Math.min(fittedBoardWidth, viewportHeight, BOARD_SIZE) / BOARD_SIZE;
  const activeScale =
    isCompactScreen && isZoomedIn ? COMPACT_DOUBLE_TAP_ZOOM_SCALE : fittedScale;
  const scaledBoardSize = BOARD_SIZE * activeScale;
  const compactCanvasSize = BOARD_SIZE * COMPACT_DOUBLE_TAP_ZOOM_SCALE;
  const boardCanvasSize = isCompactScreen ? compactCanvasSize : scaledBoardSize;
  const boardInset = isCompactScreen
    ? (compactCanvasSize - scaledBoardSize) / 2
    : 0;

  const getBoardBounds = useCallback(
    (scale: number) => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return null;
      }

      const scaledSize = BOARD_SIZE * scale;
      const canvasSize = isCompactScreen
        ? BOARD_SIZE * COMPACT_DOUBLE_TAP_ZOOM_SCALE
        : scaledSize;
      const contentWidth = Math.max(viewport.clientWidth, canvasSize);
      const contentHeight = Math.max(viewport.clientHeight, canvasSize);
      const boardInsetForScale = isCompactScreen
        ? (canvasSize - scaledSize) / 2
        : 0;

      return {
        viewport,
        scale,
        scaledSize,
        canvasSize,
        contentWidth,
        contentHeight,
        boardLeft: (contentWidth - canvasSize) / 2 + boardInsetForScale,
        boardTop: (contentHeight - canvasSize) / 2 + boardInsetForScale,
      };
    },
    [isCompactScreen],
  );

  const getBoardPointFromClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      const boardSurface = boardSurfaceRef.current;

      if (!boardSurface) {
        return null;
      }

      const rect = boardSurface.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return null;
      }

      return {
        type: "point" as const,
        boardX: Math.max(
          0,
          Math.min(BOARD_SIZE, (clientX - rect.left) / activeScale),
        ),
        boardY: Math.max(
          0,
          Math.min(BOARD_SIZE, (clientY - rect.top) / activeScale),
        ),
      };
    },
    [activeScale],
  );

  const getCellFocusTarget = useCallback(
    (row: number, col: number) => {
      const viewport = viewportRef.current;
      const boardSurface = boardSurfaceRef.current;

      if (!viewport || !boardSurface) {
        return null;
      }

      const cell = viewport.querySelector<HTMLElement>(
        `[data-board-cell="${row}-${col}"]`,
      );

      if (!cell) {
        return null;
      }

      const cellRect = cell.getBoundingClientRect();
      const boardRect = boardSurface.getBoundingClientRect();

      return {
        type: "point" as const,
        boardX: Math.max(
          0,
          Math.min(
            BOARD_SIZE,
            (cellRect.left + cellRect.width / 2 - boardRect.left) / activeScale,
          ),
        ),
        boardY: Math.max(
          0,
          Math.min(
            BOARD_SIZE,
            (cellRect.top + cellRect.height / 2 - boardRect.top) / activeScale,
          ),
        ),
      };
    },
    [activeScale],
  );

  const focusZoomTarget = useCallback(
    (
      target: ZoomFocusTarget,
      options?: { behavior?: ScrollBehavior; scale?: number },
    ) => {
      const scale = options?.scale ?? activeScale;
      const bounds = getBoardBounds(scale);

      if (!bounds) {
        return;
      }

      const resolvedTarget =
        target.type === "cell"
          ? getCellFocusTarget(target.row, target.col)
          : target;

      if (!resolvedTarget) {
        return;
      }

      const nextLeft =
        bounds.boardLeft +
        resolvedTarget.boardX * bounds.scale -
        bounds.viewport.clientWidth / 2;
      const nextTop =
        bounds.boardTop +
        resolvedTarget.boardY * bounds.scale -
        bounds.viewport.clientHeight / 2;
      const maxLeft = Math.max(
        0,
        bounds.contentWidth - bounds.viewport.clientWidth,
      );
      const maxTop = Math.max(
        0,
        bounds.contentHeight - bounds.viewport.clientHeight,
      );

      bounds.viewport.scrollTo({
        left: Math.max(0, Math.min(maxLeft, nextLeft)),
        top: Math.max(0, Math.min(maxTop, nextTop)),
        behavior: options?.behavior ?? "smooth",
      });
    },
    [activeScale, getBoardBounds, getCellFocusTarget],
  );

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateWidth = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const previousDraftCount = previousDraftCountRef.current;
    const previousTurn = previousTurnRef.current;

    if (
      isCompactScreen &&
      isZoomedIn &&
      previousDraftCount > 0 &&
      draftCount === 0 &&
      (game.turn !== previousTurn || animationPhase === "score-burst")
    ) {
      pendingZoomFocusRef.current = null;
      pendingZoomOutCenterRef.current = true;
      setIsZoomedIn(false);
    }

    if (isCompactScreen && draftCount > previousDraftCount) {
      const latestPlacement = game.draft.at(-1);

      if (latestPlacement) {
        const target = {
          type: "cell" as const,
          row: latestPlacement.row,
          col: latestPlacement.col,
        };

        if (!isZoomedIn) {
          pendingZoomFocusRef.current = target;
          queuedZoomFrameRef.current = window.requestAnimationFrame(() => {
            queuedZoomFrameRef.current = null;
            setIsZoomScrollEnabled(false);
            setIsZoomedIn(true);
          });
        }
      }
    }

    previousDraftCountRef.current = draftCount;
    previousTurnRef.current = game.turn;

    return () => {
      if (queuedZoomFrameRef.current !== null) {
        window.cancelAnimationFrame(queuedZoomFrameRef.current);
        queuedZoomFrameRef.current = null;
      }
    };
  }, [
    animationPhase,
    draftCount,
    game.draft,
    game.turn,
    isCompactScreen,
    isZoomedIn,
  ]);

  useEffect(() => {
    if (!isCompactScreen || !isZoomedIn) {
      return;
    }

    if (zoomTransitionTimeoutRef.current !== null) {
      window.clearTimeout(zoomTransitionTimeoutRef.current);
      zoomTransitionTimeoutRef.current = null;
    }

    zoomTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsZoomScrollEnabled(true);
      zoomTransitionTimeoutRef.current = null;
    }, BOARD_ZOOM_TRANSITION_MS);

    return () => {
      if (zoomTransitionTimeoutRef.current !== null) {
        window.clearTimeout(zoomTransitionTimeoutRef.current);
        zoomTransitionTimeoutRef.current = null;
      }
    };
  }, [isCompactScreen, isZoomedIn]);

  useLayoutEffect(() => {
    if (!isCompactScreen || !isZoomedIn) {
      return;
    }

    const pendingTarget = pendingZoomFocusRef.current;

    if (!pendingTarget) {
      return;
    }

    focusZoomTarget(pendingTarget, {
      behavior: "auto",
      scale: activeScale,
    });
    pendingZoomFocusRef.current = null;
  }, [
    activeScale,
    focusZoomTarget,
    isCompactScreen,
    isZoomedIn,
    scaledBoardSize,
  ]);

  useLayoutEffect(() => {
    if (isZoomedIn || pendingZoomOutCenterRef.current) {
      return;
    }

    const bounds = getBoardBounds(activeScale);

    if (!bounds) {
      return;
    }

    const centeredLeft = Math.max(
      0,
      Math.min(
        bounds.contentWidth - bounds.viewport.clientWidth,
        bounds.boardLeft,
      ),
    );
    const centeredTop = Math.max(
      0,
      Math.min(
        bounds.contentHeight - bounds.viewport.clientHeight,
        bounds.boardTop,
      ),
    );

    bounds.viewport.scrollTo({
      left: centeredLeft,
      top: centeredTop,
      behavior: "auto",
    });
  }, [activeScale, getBoardBounds, isZoomedIn]);

  useEffect(() => {
    if (isZoomedIn || !pendingZoomOutCenterRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const bounds = getBoardBounds(activeScale);

      if (!bounds) {
        return;
      }

      const centeredLeft = Math.max(
        0,
        Math.min(
          bounds.contentWidth - bounds.viewport.clientWidth,
          bounds.boardLeft,
        ),
      );
      const centeredTop = Math.max(
        0,
        Math.min(
          bounds.contentHeight - bounds.viewport.clientHeight,
          bounds.boardTop,
        ),
      );

      bounds.viewport.scrollTo({
        left: centeredLeft,
        top: centeredTop,
        behavior: "auto",
      });
      pendingZoomOutCenterRef.current = false;
    }, BOARD_ZOOM_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeScale, getBoardBounds, isZoomedIn]);

  function toggleZoom(target?: ZoomFocusTarget | null) {
    if (!isCompactScreen) {
      return;
    }

    setIsZoomScrollEnabled(false);
    pendingZoomOutCenterRef.current = isZoomedIn;

    if (!isZoomedIn && target) {
      pendingZoomFocusRef.current = target;
    }

    setIsZoomedIn((current) => !current);
  }

  return (
    <div
      ref={viewportRef}
      className={cn(
        boardViewportVariants(),
        isCompactScreen && (!isZoomedIn || !isZoomScrollEnabled)
          ? "overflow-hidden"
          : "overflow-auto",
        "w-full",
        className,
      )}
      onDoubleClick={(event) => {
        event.preventDefault();

        if (
          isInteractiveTarget(event.target) ||
          Date.now() - lastTouchZoomAtRef.current <=
            TOUCH_DOUBLE_CLICK_SUPPRESSION_MS
        ) {
          return;
        }

        toggleZoom(getBoardPointFromClientPoint(event.clientX, event.clientY));
      }}
      onPointerUp={(event) => {
        if (
          event.pointerType !== "touch" ||
          isInteractiveTarget(event.target) ||
          !isCompactScreen
        ) {
          return;
        }

        const now = Date.now();
        if (now - lastTouchToggleRef.current <= DOUBLE_TAP_DELAY_MS) {
          event.preventDefault();
          lastTouchZoomAtRef.current = now;
          toggleZoom(
            getBoardPointFromClientPoint(event.clientX, event.clientY),
          );
          lastTouchToggleRef.current = 0;
          return;
        }

        lastTouchToggleRef.current = now;
      }}
    >
      <div
        className="grid place-items-center"
        style={
          {
            width: Math.max(viewportWidth, boardCanvasSize),
            height: Math.max(viewportHeight, boardCanvasSize),
          } satisfies CSSProperties
        }
      >
        <div
          style={{
            width: boardCanvasSize,
            height: boardCanvasSize,
            position: "relative",
          }}
        >
          <div
            ref={boardSurfaceRef}
            className="absolute left-0 top-0 origin-top-left transition-transform ease-out"
            style={{
              width: BOARD_SIZE,
              height: BOARD_SIZE,
              transform: `translate(${boardInset}px, ${boardInset}px) scale(${activeScale})`,
              transitionDuration: `${BOARD_ZOOM_TRANSITION_MS}ms`,
            }}
          >
            <div className={boardVariants()}>
              <div className="absolute inset-2.5" />
              {board.map((row) => (
                <div
                  key={`board-row-${row[0].row}`}
                  className="grid grid-cols-15"
                >
                  {row.map((cell) => {
                    const key = positionKey(cell.row, cell.col);
                    const markers = markersByCell.get(key) ?? [];
                    const isMarkerOpen = markers.some(
                      (marker) => marker.id === activeMarkerId,
                    );

                    return (
                      <BoardCell
                        key={`square-${cell.row}-${cell.col}`}
                        cell={cell}
                        draftTile={game.draft.find(
                          (placement) =>
                            placement.row === cell.row &&
                            placement.col === cell.col,
                        )}
                        highlightTone={highlightByCell.get(key)}
                        markers={markers}
                        markerTone={
                          markers.length > 0
                            ? getMarkerTone(markers)
                            : undefined
                        }
                        isMarkerOpen={isMarkerOpen}
                        onToggleMarker={() => {
                          const markerId = markers[0]?.id;
                          setOpenMarkerId((current) =>
                            current === markerId ? null : (markerId ?? null),
                          );
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
