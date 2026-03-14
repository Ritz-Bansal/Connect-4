import { WebSocketServer, WebSocket } from "ws";
import type { Room, WaitingPlayer } from "./types/types";
import { create_board, gamingEngine } from "./gamingEngine";


const wss = new WebSocketServer({ port: 8080 });

// ek chiz yeh ki If I want automatic matching, then mein sochra hu ki ek variable bana luga jaha pe
// waiting player rahega, jaise hi koi dusra player connects, match them automatically, easy and good
// mtlb 2 chiz, 1 for waiting players and another for active rooms

let waitingPlayer: WaitingPlayer = {
  player: null,
  roomId: null,
};

// map mein O(1) rahega lookup, array of objects mein O(N) 
const rooms: Map<string, Room> = new Map();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

wss.on("connection", (ws: WebSocket) => {
  console.log("player connected");

  ws.on("message", (message) => {
    try{
      const data = JSON.parse(message.toString());
      const type = (data.type).toUpperCase();

      console.log(data);
      if(!type){
        ws.send(JSON.stringify({
          message: "Konsa game kheloge"
        }))
      }
  
      if(type == "PLAY_CONNECT_4"){
        console.log("Inside");
        if(waitingPlayer.player != null && waitingPlayer.roomId != null){
          const roomId = waitingPlayer.roomId;
          const room = rooms.get(roomId);
  
          // if(!room) bohot fikkat, as agar yeh hogaya phir toh bohot dikkat
          if(!room){
            throw new Error("Code RED, System Breached");
          }

          room.players.push(ws);

          if(room.players.length > 2){
            throw new Error("Total players in a room breached");
          }
  
          waitingPlayer.player = null;
          waitingPlayer.roomId = null;
          ws.roomId = roomId;
  
          // start the game
          room.players[0]?.send(JSON.stringify({
            message: "Game starting, aajao fas fas",
            color: "RED",
            turn: 0
          }));
          room.players[1]?.send(JSON.stringify({
            message: "Game starting, aajao fas fas",
            color: "YELLOW",
            turn: 0
          }));

          return;
        }
  
        const roomId = generateRoomId();
  
        rooms.set(roomId, {
          players: [ws], 
          board: create_board(),
          turn: 0,
          rowIdx: [5, 5, 5 ,5 ,5, 5, 5], // O(1) TC milegi inse
          counter: 0
        })
  
        waitingPlayer.player = ws;
        waitingPlayer.roomId = roomId;
        ws.roomId = roomId;
  
        ws.send(JSON.stringify({
          message: "Waiting for someone to join"
        }));
        
        return;
      }

      if(type == "MOVE"){
        const roomId = ws.roomId;
        const room = rooms.get(roomId);
        const column: number = data.column;

        if(!room){
          return ws.send(JSON.stringify({
            message: "Vapas se masti"
          }));
        }

        // Must be your turn to play
        if(room.players[room.turn] !== ws){
           return ws.send(JSON.stringify({
             message: "Not your turn"
           }));
        }

        if(column === undefined){
          return ws.send(JSON.stringify({
            message: "Nahi chalega"
          }));
        }

        const response = gamingEngine(room, column, room.turn);
        
        if(response && response.nextTurn !== undefined){
            room.turn = response.nextTurn;
        }
         
        room.players.forEach((player) => {
          player.send(JSON.stringify(response));
        })

      }
    }catch(error){
      ws.send(JSON.stringify({
        message: "Goli beta, masti nahi"
      }));
    }
  }); 

  ws.on("close", () => {
    if(waitingPlayer.player === ws){
      waitingPlayer.player = null;
      waitingPlayer.roomId = null;
    }

    console.log("Browser closed");
    const roomId = ws.roomId;
    if(!roomId) return;

    const room = rooms.get(roomId);
    if(!room) return;

    if(room.players[0] == ws){
      room.players[1]?.send(JSON.stringify({
        message: "You won, player 1 left"
      }));
    }else{
      room.players[0]?.send(JSON.stringify({
        message: "You won, player 2 left"
      }));
    }
  });

});

console.log("WebSocket server running on 8080");
