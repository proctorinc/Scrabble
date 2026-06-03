import { CpuDifficulty, LocalGameConfig } from "@/types/game";
import { getCpuConfig } from "@/lib/scrabble/cpu";

export function createLocalTwoPlayerConfig(): LocalGameConfig {
  return {
    players: [
      { name: "Player 1", kind: "human-local" },
      { name: "Player 2", kind: "human-local" },
    ],
  };
}

export function createHumanVsCpuConfig(difficulty: CpuDifficulty): LocalGameConfig {
  return {
    players: [
      { name: "Player 1", kind: "human-local" },
      { name: "CPU", kind: "computer", cpuConfig: getCpuConfig(difficulty) },
    ],
  };
}

export function getPlayerLabel(config: LocalGameConfig["players"][number]) {
  if (config.kind !== "computer" || !config.cpuConfig) {
    return config.name;
  }

  return `${config.name} (${config.cpuConfig.difficulty[0].toUpperCase()}${config.cpuConfig.difficulty.slice(1)})`;
}
