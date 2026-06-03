"use client";

import { useState } from "react";
import {
  IconArrowBack,
  IconArrowsShuffle,
  IconCancel,
  IconReplace,
} from "@tabler/icons-react";
import { ActionConfirmationDialog } from "@/components/action/action-confirmation-dialog";
import { Rack } from "@/components/player/rack";
import { TradeTilesModal } from "@/components/player/trade-tiles-modal";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/game-context";

export function ActionBar() {
  const { currentPlayer, game, dictionary, isInteractionLocked, isCpuTurnInProgress, validationMessage, submitCurrentMove, passCurrentTurn, shuffleCurrentRack, returnTiles } =
    useGame();
  const [tradeOpen, setTradeOpen] = useState(false);
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);

  const canPlay = dictionary.ready && !isInteractionLocked && game.status === "active" && game.draft.length > 0 && !validationMessage;
  const canReturnTiles = !isInteractionLocked && game.draft.length > 0;
  const trayControls = [
    {
      key: "pass",
      label: "Pass turn",
      icon: <IconCancel className="aspect-square w-5" />,
      disabled: isInteractionLocked,
      onClick: () => setSkipConfirmOpen(true),
    },
    {
      key: "swap",
      label: "Swap tiles",
      icon: <IconReplace className="aspect-square w-5" />,
      disabled: isInteractionLocked,
      onClick: () => setTradeOpen(true),
    },
    ...(currentPlayer.rack.length === 7
      ? [
          {
            key: "shuffle",
            label: "Shuffle rack",
            icon: <IconArrowsShuffle className="aspect-square w-5" />,
            disabled: isInteractionLocked,
            onClick: shuffleCurrentRack,
          },
        ]
      : []),
    {
      key: "return",
      label: "Return played tiles",
      icon: <IconArrowBack className="aspect-square w-5" />,
      disabled: !canReturnTiles,
      onClick: returnTiles,
    },
  ];

  return (
    <div className="hidden w-full flex-col items-center justify-center gap-3 sm:flex lg:gap-5">
      <div className="hidden w-full max-w-5xl items-center gap-3 sm:flex">
        <div className="paper-panel flex h-fit flex-1 items-center justify-center rounded-[26px] border border-panel p-2.5">
          <Rack />
        </div>
        <div className="flex items-center gap-2">
          {trayControls.map((control) => (
            <Button
              key={control.key}
              type="button"
              disabled={control.disabled}
              onClick={control.onClick}
              variant="ghost"
              size="icon"
              className="aspect-square h-11 w-11 rounded-2xl"
              aria-label={control.label}
            >
              {control.icon}
            </Button>
          ))}
          <Button
            type="button"
            disabled={!canPlay}
            onClick={submitCurrentMove}
            size="lg"
            className="min-w-40 rounded-full px-8 text-2xl font-bold"
          >
            {isCpuTurnInProgress ? "CPU..." : "Play"}
          </Button>
        </div>
      </div>
      <TradeTilesModal open={tradeOpen} onClose={() => setTradeOpen(false)} />
      <ActionConfirmationDialog
        open={skipConfirmOpen}
        title="Skip this turn?"
        description="You will pass without scoring and hand the game to the next player."
        confirmLabel="Skip Turn"
        onCancel={() => setSkipConfirmOpen(false)}
        onConfirm={() => {
          passCurrentTurn();
          setSkipConfirmOpen(false);
        }}
      />
    </div>
  );
}
