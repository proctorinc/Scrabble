"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Link from "next/link";
import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { ActionBar } from "@/components/action/action-bar";
import { Board } from "@/components/board/board";
import { GameSetupPanel } from "@/components/game/game-setup-panel";
import { HandoffOverlay } from "@/components/game/handoff-overlay";
import { ScoreBurstOverlay } from "@/components/game/score-burst-overlay";
import { MobileActionBar } from "@/components/action/mobile-action-bar";
import { BlankPickerModal } from "@/components/player/blank-picker-modal";
import { Tile } from "@/components/player/tile";
import { SideTabs } from "@/components/tabs/side-tabs";
import { MobileTitleBar } from "@/components/title/mobile-title-bar";
import { TitleBar } from "@/components/title/title-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGame } from "@/context/game-context";
import {
  createHumanVsCpuConfig,
  createLocalTwoPlayerConfig,
} from "@/lib/scrabble/setup";
import { cn } from "@/lib/utils";
import { CpuDifficulty } from "@/types/game";

export function PlaySurface() {
  const {
    blankTileId,
    currentPlayer,
    dictionary,
    dragTileId,
    game,
    getPlayerTileTint,
    isStorageHydrated,
    isCpuTurnInProgress,
    isInteractionLocked,
    onDragCancel,
    onDragEnd,
    onDragStart,
    playedTilesUsePlayerColors,
    chooseBlankLetter,
    closeBlankPicker,
    startLocalGame,
  } = useGame();
  const [dragOverlaySize, setDragOverlaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [mobileBoardHeight, setMobileBoardHeight] = useState(0);
  const [mobileTrayHeight, setMobileTrayHeight] = useState(0);
  const mobileTrayRef = useRef<HTMLDivElement | null>(null);
  const mobileBoardFrameRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const blankTile =
    game.draft.find((placement) => placement.tile.id === blankTileId)?.tile ??
    null;
  const dragTile =
    currentPlayer.rack.find((tile) => tile.id === dragTileId) ??
    game.draft.find((placement) => placement.tile.id === dragTileId)?.tile ??
    null;

  function handleStart(mode: "local" | "cpu", difficulty: CpuDifficulty) {
    startLocalGame(
      mode === "cpu"
        ? createHumanVsCpuConfig(difficulty)
        : createLocalTwoPlayerConfig(),
    );
  }

  function handleDragStart(event: Parameters<typeof onDragStart>[0]) {
    const initialRect = event.active.rect.current.initial;
    if (initialRect) {
      setDragOverlaySize({
        width: initialRect.width,
        height: initialRect.height,
      });
    } else {
      setDragOverlaySize(null);
    }

    onDragStart(event);
  }

  function handleDragEnd(event: Parameters<typeof onDragEnd>[0]) {
    setDragOverlaySize(null);
    onDragEnd(event);
  }

  function handleDragCancel(event: Parameters<typeof onDragCancel>[0]) {
    setDragOverlaySize(null);
    onDragCancel(event);
  }

  useLayoutEffect(() => {
    const tray = mobileTrayRef.current;
    const boardFrame = mobileBoardFrameRef.current;

    if (!tray || !boardFrame) {
      return;
    }

    const updateLayout = () => {
      setMobileTrayHeight(tray.clientHeight);
      const trayRect = tray.getBoundingClientRect();
      const boardFrameRect = boardFrame.getBoundingClientRect();
      setMobileBoardHeight(Math.max(0, trayRect.top - boardFrameRect.top));
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(tray);
    observer.observe(boardFrame);
    window.addEventListener("resize", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [game.status]);

  if (game.status === "idle") {
    return (
      <main className="game-shell flex min-h-screen items-center justify-center px-6 py-10">
        {isStorageHydrated ? (
          <GameSetupPanel
            title="Start Local Game"
            description="No unfinished game is saved right now. Completed games stay archived on this device."
            onStart={handleStart}
            showBackHome
          />
        ) : (
          <Card className="w-full max-w-md text-center">
            <CardHeader className="items-center">
              <CardTitle className="text-3xl">Loading Game</CardTitle>
              <CardDescription>
                Checking for a game already in progress.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <main
        className="game-shell relative flex min-h-[100dvh] w-full justify-center px-0 py-0 sm:px-4 sm:py-3 lg:px-5 lg:py-5"
        style={
          {
            "--mobile-tray-height": `${mobileTrayHeight}px`,
          } as CSSProperties
        }
      >
        <div className="flex w-full max-w-[92rem] flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6 xl:gap-8">
          <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col gap-3 pb-[var(--mobile-tray-height,0px)] sm:min-h-[calc(100dvh-1.5rem)] sm:pb-[calc(var(--mobile-tray-height,0px)+1rem)] lg:min-h-0 lg:max-w-[48rem] lg:gap-5 lg:pb-[36px]">
            <MobileTitleBar />
            <div
              ref={mobileBoardFrameRef}
              className="relative flex min-h-0 flex-1 items-center justify-center sm:block"
              style={
                mobileBoardHeight > 0
                  ? ({
                      height: mobileBoardHeight,
                      maxHeight: mobileBoardHeight,
                    } satisfies CSSProperties)
                  : undefined
              }
            >
              <Board
                className={cn("h-full", mobileBoardHeight > 0 && "max-h-full")}
              />
              {!dictionary.ready ? (
                <p className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-center text-sm text-muted-foreground shadow-sm sm:static sm:translate-x-0 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-0 sm:shadow-none">
                  Loading dictionary...
                </p>
              ) : null}
            </div>
            <ActionBar />
          </div>
          <div
            id="right-sidebar"
            className="hidden min-h-0 w-[22rem] shrink-0 flex-col gap-4 lg:flex xl:w-[24rem] xl:gap-5"
          >
            <TitleBar />
            <SideTabs />
          </div>
        </div>
        {game.status === "completed" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-overlay p-6 backdrop-blur-[2px]">
            <Card className="w-full max-w-md text-center">
              <CardHeader className="items-center">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Game Over
                </span>
                <CardTitle className="text-3xl">
                  {game.players.find((player) => player.id === game.winnerId)
                    ?.name ?? "Winner"}{" "}
                  wins
                </CardTitle>
                <CardDescription>
                  This finished game has been archived locally, so you can start
                  another one whenever you are ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center gap-3">
                <Button type="button" onClick={() => startLocalGame()}>
                  New Game
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
        <ScoreBurstOverlay />
        <HandoffOverlay />
        <BlankPickerModal
          open={Boolean(blankTile)}
          onSelect={chooseBlankLetter}
          onClose={closeBlankPicker}
        />
        {isInteractionLocked && currentPlayer.kind === "computer" ? (
          <div className="pointer-events-none absolute inset-0 z-10 bg-transparent" />
        ) : null}
        <div
          ref={mobileTrayRef}
          className="fixed inset-x-0 bottom-0 z-10 sm:hidden"
        >
          <MobileActionBar />
        </div>
      </main>
      <DragOverlay>
        {dragTile ? (
          <div
            style={
              dragOverlaySize
                ? {
                    width: dragOverlaySize.width,
                    height: dragOverlaySize.height,
                  }
                : undefined
            }
          >
            <Tile
              tile={dragTile}
              size="board"
              tint={
                playedTilesUsePlayerColors
                  ? getPlayerTileTint(currentPlayer.id)
                  : "neutral"
              }
              className="scale-110 shadow-none"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
