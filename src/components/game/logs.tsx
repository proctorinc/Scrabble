"use client";

import { useGame } from "@/context/game-context";

export function Logs() {
  const { game } = useGame();
  const leftPlayerId = game.players[1]?.id;
  const rightPlayerId = game.players[0]?.id;

  return (
    <div className="flex h-full min-h-0 flex-col justify-end gap-4 overflow-y-auto p-3 pb-16 text-sm">
      {game.logs.map((log) => {
        const isRightPlayer = log.playerId === rightPlayerId;
        const isLeftPlayer = log.playerId === leftPlayerId;

        return (
          <div
            key={log.id}
            className={
              isRightPlayer
                ? "flex w-full items-center justify-end gap-1"
                : "flex w-full items-center gap-1"
            }
          >
            {isLeftPlayer ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-log-rose font-semibold text-player-rose shadow-[var(--shadow-badge)]">
                P2
              </span>
            ) : null}
            <div className="flex w-fit items-center gap-1 rounded-2xl border border-panel-faint bg-surface-tabs px-3 py-2 shadow-[var(--shadow-inset-soft)]">
              <span className="text-xs">{log.summary}</span>
            </div>
            {isRightPlayer ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-log-blue font-semibold text-player-blue shadow-[var(--shadow-badge)]">
                P1
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
