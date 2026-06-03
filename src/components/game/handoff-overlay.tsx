"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGame } from "@/context/game-context";

export function HandoffOverlay() {
  const { game, currentPlayer, continueFromHandoff, isScoreCelebrationActive } =
    useGame();

  if (isScoreCelebrationActive || game.status !== "handoff" || !game.handoff) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-overlay p-6 backdrop-blur-[2px]">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Pass and Play
          </span>
          <CardTitle>{currentPlayer.name}, your turn</CardTitle>
          <CardDescription>
            Hand the device to {currentPlayer.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            type="button"
            onClick={continueFromHandoff}
            size="lg"
            className="min-w-40"
          >
            Reveal Rack
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
