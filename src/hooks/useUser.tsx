import useAuth from "./useAuth";

const useUser = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    throw new Error("useUser has to be used within <AuthPage>");
  }

  return currentUser;
};

export default useUser;
