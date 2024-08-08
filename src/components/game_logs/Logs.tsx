import { useEffect, useState } from "react";
import useGame from "../../hooks/useGame";
import { GameLog } from "../../types";
import Log from "./Log";

const Logs = () => {
  const { gameId, state } = useGame();
  const [logs, setLogs] = useState<GameLog[]>([]);

  function getGameLogs(gameId: string) {
    fetch(`http://localhost:8080/v1/game/${gameId}/logs`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setLogs(data.logs))
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    if (gameId) {
      getGameLogs(gameId);
    }
  }, [state, gameId]);

  return (
    <div className="flex flex-col justify-end gap-4 text-sm p-3 pb-16">
      {logs.map((log) => (
        <Log key={log.id} log={log} />
      ))}
    </div>
  );
};

export default Logs;
