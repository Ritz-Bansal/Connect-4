import { useState } from "react";
import "./index.css";

export function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const array = new Array(42).fill(null);

  const startGame = async () => {
    setWaiting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setWaiting(false);
    setGameStarted(true);

    // Connect to backend via WebSocket
    // const socket = new WebSocket("ws://localhost:8080");

    // socket.onopen = () => {
    //   console.log("Connected to server");
    // };

    // socket.onmessage = (msg) => {
    //   const data = msg.data;
    //   // Example: start game when server sends "start"
    //   if (data === "start") {
    //     setGameStarted(true);
    //     setWaiting(false);
    //   }
    //   console.log("Received:", data);
    // };

    // socket.onerror = (err) => {
    //   console.error("WebSocket error:", err);
    // };

    // setWs(socket);
  };

  return (
    <div className="h-screen w-screen bg-gray-100">
      <div className="fixed top-0 left-0 p-4  font-bold text-xl">  {/*bg-gray-800 text-white */}
        CONNECT 4
      </div>

      <div className="h-screen flex justify-center items-center">
        {!gameStarted ? (
          waiting ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-1 border-4 border-blue-400 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
              <div className="text-gray-700 font-semibold">
                Waiting for another player...
              </div>
            </div>
          ) : (
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
              onClick={startGame}
            >
              Play Game
            </button>
          )
        ) : (
          <div className="grid grid-rows-6 grid-cols-7 gap-2 w-[50%] h-[50%] bg-red-100 p-2">
            {array.map((i, idx) => (
              <div
                key={idx}
                className="bg-blue-200 hover:bg-pink-200 flex items-center justify-center rounded-full"
              >
                {i}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
