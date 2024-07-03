import { Navigate, useRoutes } from "react-router-dom";
import Play from "../pages/Play";
import Start from "../pages/Start";
import GameProviders from "../providers/GameProviders";
import Join from "../pages/Join";

const AppRoutes = () => {
  const commonRoutes = [
    { path: "*", element: <Navigate to="." /> },
    { path: "/", element: <Start /> },
    {
      path: "/join/:gameId",
      element: (
        <GameProviders>
          <Join />
        </GameProviders>
      ),
    },
    {
      path: "/play/:gameId",
      element: (
        <GameProviders>
          <Play />
        </GameProviders>
      ),
    },
  ];

  const routes = useRoutes(commonRoutes);
  return <div>{routes}</div>;
};

export default AppRoutes;
