import { useEffect } from "react";
import { socket } from "../websocket";

const useWebsocket = () => {
  function onConnect(event) {
    console.log("Connected to socket!");
  }

  function onMessage(event) {
    console.log("Message from server: ", event.data);
  }

  useEffect(() => {
    socket.addEventListener("open", onConnect);

    socket.addEventListener("message", onMessage);

    return () => {
      socket.removeEventListener("open", onConnect);
      socket.removeEventListener("message", onMessage);
    };
  }, []);

  return socket;
};

export default useWebsocket;
