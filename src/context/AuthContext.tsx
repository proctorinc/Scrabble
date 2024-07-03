import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { User } from "../types";

type Props = {
  children: ReactNode;
};

type AuthContext = {
  isAuthenticated: boolean;
  currentUser: User | null;
};

const AuthContext = createContext<AuthContext | null>(null);

export const AuthContextProvider: FC<Props> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser === null) {
      fetch("http://localhost:8080/v1/user/me", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => setCurrentUser(data.user))
        .catch((err) => console.error(err));
    }
    console.log(currentUser);
  }, [currentUser]);

  const contextData = {
    isAuthenticated: currentUser !== null,
    currentUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
