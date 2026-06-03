"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameSetupPanel } from "@/components/game/game-setup-panel";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/game-context";
import {
  createHumanVsCpuConfig,
  createLocalTwoPlayerConfig,
} from "@/lib/scrabble/setup";
import { CpuDifficulty } from "@/types/game";

export function HomeScreen() {
  const router = useRouter();
  const { hasSavedGame, isStorageHydrated, startLocalGame } = useGame();

  function handleStartLocalGame(
    mode: "local" | "cpu",
    difficulty: CpuDifficulty,
  ) {
    startLocalGame(
      mode === "cpu"
        ? createHumanVsCpuConfig(difficulty)
        : createLocalTwoPlayerConfig(),
    );
    router.push("/play");
  }

  return (
    <main className="game-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-6xl font-extrabold text-display-strong sm:text-7xl">
            Scrapple
          </h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            A warm little tabletop take on pass-and-play word battles.
          </p>
        </div>
        {isStorageHydrated ? (
          hasSavedGame ? (
            <div className="flex w-full max-w-md flex-col gap-3 rounded-[32px] border border-panel bg-card/95 p-6 text-center shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-semibold text-display-strong">
                Resume Current Game
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                A game is already in progress on this device. Finish it before
                starting another one.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/play">Continue Game</Link>
              </Button>
            </div>
          ) : (
            <GameSetupPanel
              title="New Game"
              description="Completed games are archived to this device, so you can start a fresh match once the last one is finished."
              onStart={handleStartLocalGame}
            />
          )
        ) : (
          <Button type="button" size="lg" className="w-full max-w-md" disabled>
            Checking Saved Game
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="w-full max-w-md">
          <Link href="/online">Online Placeholder</Link>
        </Button>
      </div>
    </main>
  );
}
