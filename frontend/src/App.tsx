import { useState } from "react";
import "./index.css";

export function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // 6 rows, 7 columns
  const [board, setBoard] = useState<(string | null)[][]>(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [myColor, setMyColor] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [inputCol, setInputCol] = useState<string>("");

  const startGame = async () => {
    setWaiting(true);
    const socket = new WebSocket("wss://connect-4-1-q323.onrender.com");

    socket.onopen = () => {
      console.log("Connected to server");
      socket.send(JSON.stringify({ type: "play_connect_4" }));
    };

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      console.log("Received:", data);
      
      if (data.message === "Game starting, aajao fas fas") {
        setGameStarted(true);
        setWaiting(false);
        setMyColor(data.color);
        setCurrentTurn(data.turn);
        setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
        setGameOverMessage(null);
      }

      if (data.move) {
        setBoard((prev) => {
          const newBoard = prev.map(row => [...row]);
          newBoard[data.move.row]![data.move.column] = data.move.color;
          return newBoard;
        });
      }

      if (data.nextTurn !== undefined) {
        setCurrentTurn(data.nextTurn);
      }

      if (data.message && (data.message.includes("won") || data.message === "Draw" || data.message === "Vapas se masti")) {
        setGameOverMessage(data.message);
      } else if (data.message && ["Incorrect inputs", "Nahi chalega", "Not your turn"].includes(data.message)) {
        alert(data.message);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setWaiting(false);
    };

    setWs(socket);
  };

  const sendMove = () => {
    if (!ws || gameOverMessage) return;

    // Check if it's actually the player's turn before parsing move
    const isPlayer1 = myColor === "RED";
    if ((isPlayer1 && currentTurn !== 0) || (!isPlayer1 && currentTurn !== 1)) {
      alert(`It's Player ${currentTurn + 1}'s turn right now`);
      return;
    }

    const colNum = parseInt(inputCol);
    if (!isNaN(colNum) && colNum >= 1 && colNum <= 7) {
      ws.send(JSON.stringify({ type: "MOVE", column: colNum }));
      setInputCol(""); 
    } 
    else {
      alert("Please enter a valid column between 1 and 7");
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col items-center overflow-hidden">
      <div className="w-full p-2 sm:p-4 font-bold text-xl sm:text-2xl text-center bg-white shadow-sm tracking-widest text-indigo-900 border-b">
        CONNECT 4
      </div>

      <div className="flex-1 flex justify-center items-center w-full max-w-4xl p-2 sm:p-4 overflow-hidden">
        {!gameStarted ? (
          waiting ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="border-4 border-blue-500 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
              <div className="text-gray-700 font-semibold text-lg">
                Waiting for another player...
              </div>
            </div>
          ) : (
            <button
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 text-lg"
              onClick={startGame}
            >
              Play Game
            </button>
          )
        ) : (
          <div className="flex flex-col items-center w-full space-y-3 sm:space-y-4">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md w-full max-w-md border border-gray-200">
              <div className="flex items-center justify-between w-full text-base sm:text-lg font-semibold text-gray-800">
                <span className="flex items-center gap-2">
                  You are:
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-inner border border-black/10 ${myColor === "RED" ? "bg-red-500" : "bg-yellow-400"}`}
                  ></div>
                  {myColor}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 block text-sm sm:text-base">
                  Turn: Player {currentTurn + 1}
                  {((currentTurn === 0 && myColor === "RED") ||
                    (currentTurn === 1 && myColor === "YELLOW")) &&
                    " (You)"}
                </span>
              </div>

              {gameOverMessage && (
                <div className="text-2xl font-black text-indigo-700 mt-4 animate-bounce text-center">
                  {gameOverMessage}
                </div>
              )}
            </div>



            <div className="bg-blue-600 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl border-b-4 sm:border-b-8 border-blue-800">
              <div className="grid grid-rows-6 grid-cols-7 gap-2 sm:gap-3">
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 border-black/20 shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]
                        ${cell === "RED" ? "bg-red-500" : cell === "YELLOW" ? "bg-yellow-400" : "bg-gray-100"}
                      `}
                    />
                  )),
                )}
              </div>
            </div>


            {!gameOverMessage && (
              <div className="flex gap-2 sm:gap-4 items-center bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <label className="font-semibold text-gray-700 text-sm sm:text-base">
                  Enter your move:
                </label>
                <input
                  type="text"
                  min="1"
                  max="7"
                  value={inputCol}
                  onChange={(e) => setInputCol(e.target.value)}
                  placeholder="1-7"
                  className="placeholder:text-gray-400 px-3 sm:px-4 py-1 sm:py-2 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-indigo-500 w-24 sm:w-32 text-center text-lg sm:text-xl font-bold transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && sendMove()}
                />
                <button
                  onClick={sendMove}
                  className="px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition-colors text-sm sm:text-base"
                >
                  Confirm Move
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
