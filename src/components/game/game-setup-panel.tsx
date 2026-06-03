"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CpuDifficulty } from "@/types/game";

type GameMode = "local" | "cpu";

const CPU_LEVELS: CpuDifficulty[] = ["easy", "medium", "hard"];

export function GameSetupPanel({
  title,
  description,
  onStart,
  showBackHome = false,
}: {
  title: string;
  description: string;
  onStart: (mode: GameMode, difficulty: CpuDifficulty) => void;
  showBackHome?: boolean;
}) {
  const [mode, setMode] = useState<GameMode>("local");
  const [difficulty, setDifficulty] = useState<CpuDifficulty>("medium");

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="items-center pb-4 text-center">
        <Badge>Table Setup</Badge>
        <CardTitle className="text-center text-4xl">{title}</CardTitle>
        <CardDescription className="max-w-sm text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <div className="grid w-full grid-cols-2 gap-3">
          <Button
            type="button"
            variant={mode === "local" ? "secondary" : "ghost"}
            className="h-auto flex-col rounded-[24px] px-4 py-4"
            onClick={() => setMode("local")}
          >
            <span>Local 2 Player</span>
          </Button>
          <Button
            type="button"
            variant={mode === "cpu" ? "secondary" : "ghost"}
            className="h-auto flex-col rounded-[24px] px-4 py-4"
            onClick={() => setMode("cpu")}
          >
            <span>Vs CPU</span>
          </Button>
        </div>
        {mode === "cpu" ? (
          <div className="w-full rounded-[24px] border border-panel bg-surface-soft-strong p-4 shadow-[var(--shadow-inset-strong)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                CPU Difficulty
              </span>
              <Badge variant="gold">Practice Match</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CPU_LEVELS.map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={difficulty === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficulty(level)}
                  className="rounded-2xl"
                >
                  {level[0].toUpperCase()}
                  {level.slice(1)}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Easier levels know fewer words and make weaker move choices. Hard
              plays stronger legal moves from a larger vocabulary.
            </p>
          </div>
        ) : (
          <div className="w-full rounded-[24px] border border-dashed border-panel-dashed bg-surface-soft-muted px-4 py-4 text-sm leading-6 text-muted-foreground">
            Local mode keeps the table simple: both players share one screen and
            take turns secretly checking their rack.
          </div>
        )}
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => onStart(mode, difficulty)}
        >
          Start Game
        </Button>
        {showBackHome ? (
          <span className="text-center text-sm leading-6 text-muted-foreground">
            Use Local 2 Player for pass-and-play or Vs CPU for solo practice.
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
