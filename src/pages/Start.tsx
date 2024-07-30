import { useNavigate } from "react-router-dom";
import useGameHistory from "../hooks/useGameHistory";

const Start = () => {
  const navigate = useNavigate();
  const { games } = useGameHistory();

  function startGame(isLocal: boolean) {
    fetch(
      `http://localhost:8080/v1/game/start?is_local=${encodeURIComponent(
        isLocal
      )}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.game_id !== undefined) {
          navigate(`/play/${data.game_id}`);
        } else {
          console.error("Failed to create new game");
        }
      });
  }

  return (
    <div className="flex flex-col gap-3 w-full h-screen items-center justify-center overflow-y-scroll">
      <div className="flex flex-col gap-10 items-center w-full max-w-md">
        <h1 className="text-6xl font-extrabold">Scrambble</h1>

        <div className="flex flex-col items-center gap-3 w-full">
          <h3 className="text-sm">New Game</h3>
          <div className="flex gap-5 w-full">
            <button
              onClick={() => startGame(true)}
              className="flex w-full justify-center p-2 border-2 border-gray-700 rounded-lg"
            >
              Local
            </button>
            <button
              onClick={() => startGame(false)}
              className="flex w-full justify-center p-2 border-2 border-gray-700 rounded-lg"
            >
              Online
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <h3 className="text-sm">My Games</h3>
          <div className="flex flex-col gap-2">
            {games.map((game) => (
              <div
                onClick={() => navigate(`/play/${game.id}`)}
                className="cursor-pointer border-2 border-black rounded-lg flex justify-between w-full p-3"
              >
                <h4>{game.status}</h4>
                <p>{game.is_local ? "Local" : "Online"}</p>
                <p>Players: {game.players.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
