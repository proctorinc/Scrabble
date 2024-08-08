import { FC, ReactNode, createContext, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

type ScoreAlertContext = {
  points: number;
  isActive: boolean;
  alertScore: (points: number) => void;
};

const ScoreAlertContext = createContext<ScoreAlertContext | null>(null);

export const ScoreAlertContextProvider: FC<Props> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (isActive) {
      console.log("timeout running");
      setTimeout(() => {
        setIsActive(false);
      }, 1500);
    }
  }, [isActive]);

  function alertScore(points: number) {
    if (!isActive) {
      console.log("scoring", points);
      setPoints(points);
      setIsActive(true);
    }
  }

  const contextData = {
    alertScore,
    points,
    isActive,
  };

  return (
    <ScoreAlertContext.Provider value={contextData}>
      {children}
    </ScoreAlertContext.Provider>
  );
};

export default ScoreAlertContext;
