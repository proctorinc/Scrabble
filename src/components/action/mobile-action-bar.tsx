"use client";

import { useState } from "react";
import {
  IconArrowBack,
  IconArrowsShuffle,
  IconMenu2,
  IconPlayerPlayFilled,
  IconReplace,
} from "@tabler/icons-react";
import { MobileMenuDrawer } from "@/components/action/mobile-menu-drawer";
import { useGame } from "@/context/game-context";
import { Rack } from "@/components/player/rack";
import { TradeTilesDrawer } from "@/components/player/trade-tiles-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileActionBar({ className }: { className?: string }) {
  const {
    dictionary,
    game,
    isInteractionLocked,
    isCpuTurnInProgress,
    validationMessage,
    submitCurrentMove,
    shuffleCurrentRack,
    returnTiles,
  } = useGame();
  const [tradeOpen, setTradeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const canPlay =
    dictionary.ready &&
    !isInteractionLocked &&
    game.status === "active" &&
    game.draft.length > 0 &&
    !validationMessage;
  const canReturnTiles = !isInteractionLocked && game.draft.length > 0;
  const trayControls = [
    {
      key: "menu",
      label: "Menu",
      icon: <IconMenu2 className="aspect-square w-5" />,
      disabled: false,
      onClick: () => setMenuOpen(true),
    },
    {
      key: "swap",
      label: "Trade",
      icon: <IconReplace className="aspect-square w-5" />,
      disabled: isInteractionLocked,
      onClick: () => setTradeOpen(true),
    },
    {
      key: "shuffle",
      label: "Shuffle",
      icon: <IconArrowsShuffle className="aspect-square w-5" />,
      disabled: isInteractionLocked,
      onClick: shuffleCurrentRack,
    },
    {
      key: "return",
      label: "Return",
      icon: <IconArrowBack className="aspect-square w-5" />,
      disabled: !canReturnTiles,
      onClick: returnTiles,
    },
  ];

  return (
    <div id="bottom-bar" className={cn("flex sm:hidden", className)}>
      <div
        id="mobile-actionbar"
        className="flex h-full w-full flex-col bg-transparent sm:rounded-[28px] sm:border sm:border-panel sm:bg-panel sm:shadow-[var(--shadow-brutal-md)]"
      >
        <Rack compact />
        <div className="flex w-full flex-grow items-start px-4 pb-4">
          <div className="flex w-full items-center gap-2">
            <div className="grid flex-1 grid-cols-2">
              {trayControls.slice(0, 2).map((control) => (
                <Button
                  key={control.key}
                  type="button"
                  disabled={control.disabled}
                  onClick={control.onClick}
                  variant="ghost"
                  className="flex flex-col aspect-square h-auto w-full rounded-xl p-0"
                  aria-label={control.label}
                >
                  {control.icon}
                  {control.label}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              disabled={!canPlay}
              onClick={submitCurrentMove}
              className="shrink-0 rounded-full px-4 py-3 text-lg font-bold"
            >
              {isCpuTurnInProgress ? "CPU" : "Play"}
              <IconPlayerPlayFilled className="aspect-square w-6" size={15} />
            </Button>
            <div className="grid flex-1 grid-cols-2">
              {trayControls.slice(2, 4).map((control) => (
                <Button
                  key={control.key}
                  type="button"
                  disabled={control.disabled}
                  onClick={control.onClick}
                  variant="ghost"
                  className="flex flex-col aspect-square h-auto w-full rounded-xl p-0"
                  aria-label={control.label}
                >
                  {control.icon}
                  {control.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TradeTilesDrawer open={tradeOpen} onClose={() => setTradeOpen(false)} />
    </div>
  );
}
