"use client";

import { ReactNode } from "react";
import { GameProvider } from "@/context/game-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
