import { FC, ReactNode } from "react";
import useAuth from "../hooks/useAuth";

type Props = {
  children: ReactNode;
};

const AuthPage: FC<Props> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <></>;
};

export default AuthPage;
