import { useContext } from "react";
import ScoreAlertContext from "../context/ScoreAlertContexrt";

const useScoreAlert = () => {
  const scoreAlertContext = useContext(ScoreAlertContext);

  if (!scoreAlertContext) {
    throw new Error(
      "useScoreAlert has to be used within <ScoreAlertContext.Provider>",
    );
  }

  return scoreAlertContext;
};

export default useScoreAlert;
