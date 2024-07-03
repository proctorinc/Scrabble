import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Join = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  function joinGame(gameId: string) {
    fetch(`http://localhost:8080/v1/game/${gameId}/join`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.gameId !== undefined) {
          navigate(`/play/${data.gameId}`);
        } else {
          navigate("/");
          console.error("Failed to join new game");
        }
      });
  }

  useEffect(() => {
    if (gameId !== undefined) {
      joinGame(gameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return <div>Join</div>;
};

export default Join;
