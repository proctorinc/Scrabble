"use client";

import { CSSProperties } from "react";
import { useGame } from "@/context/game-context";
import { cn } from "@/lib/utils";

const BURST_PARTICLES = [
  { angle: -88, distance: 70, delay: "0ms", size: 12, tint: "gold" },
  { angle: -54, distance: 88, delay: "55ms", size: 10, tint: "rose" },
  { angle: -24, distance: 76, delay: "120ms", size: 14, tint: "paper" },
  { angle: 8, distance: 96, delay: "40ms", size: 10, tint: "blue" },
  { angle: 38, distance: 84, delay: "130ms", size: 12, tint: "gold" },
  { angle: 74, distance: 72, delay: "20ms", size: 9, tint: "rose" },
  { angle: 112, distance: 92, delay: "90ms", size: 11, tint: "paper" },
  { angle: 148, distance: 82, delay: "150ms", size: 10, tint: "blue" },
  { angle: 176, distance: 68, delay: "70ms", size: 12, tint: "gold" },
  { angle: 212, distance: 86, delay: "110ms", size: 10, tint: "rose" },
  { angle: 246, distance: 94, delay: "30ms", size: 13, tint: "paper" },
];

export function ScoreBurstOverlay() {
  const { scoreCelebration } = useGame();

  if (!scoreCelebration) {
    return null;
  }

  const burstAction =
    scoreCelebration.action ??
    (typeof scoreCelebration.points === "number" ? "play" : "pass");
  const burstTitle =
    burstAction === "play"
      ? `+${scoreCelebration.points}`
      : burstAction === "trade"
        ? "Swap"
        : "Pass";
  const burstSubtitle = burstAction === "play" ? "points" : "turn";

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-6">
      <div
        key={scoreCelebration.id}
        className="score-burst-shell relative flex h-60 w-full max-w-sm items-center justify-center"
      >
        <div className="score-burst-ring score-burst-ring-delay absolute h-44 w-44 rounded-full" />
        <div className="score-burst-ring absolute h-56 w-56 rounded-full" />
        {BURST_PARTICLES.map((particle, index) => (
          <span
            key={`${scoreCelebration.id}-${index}`}
            className={cn(
              "score-burst-particle absolute rounded-full",
              particle.tint === "gold" && "bg-[color:var(--tile-accent)]",
              particle.tint === "rose" && "bg-[color:var(--player-rose)]",
              particle.tint === "blue" && "bg-[color:var(--player-blue)]",
              particle.tint === "paper" && "bg-[color:var(--accent)]",
            )}
            style={
              {
                "--burst-angle": `${particle.angle}deg`,
                "--burst-distance": `${particle.distance}px`,
                "--burst-delay": particle.delay,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              } as CSSProperties
            }
          />
        ))}
        <div className="score-burst-card relative flex min-w-[14rem] flex-col items-center rounded-[32px] border-2 border-border/85 bg-panel px-8 py-7 text-center shadow-[var(--shadow-brutal-lg)] backdrop-blur-sm">
          <span className="font-heading text-5xl leading-none text-[color:var(--hero)]">
            {burstTitle}
          </span>
          <span className="mt-2 text-base font-semibold text-foreground/80">
            {burstSubtitle}
          </span>
        </div>
      </div>
    </div>
  );
}
