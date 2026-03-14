import { WebSocketServer, WebSocket } from "ws";
import type { Room, WaitingPlayer } from "./types/types";

const wss = new WebSocketServer({ port: 8080 });

// ek chiz yeh ki If I want automatic matching, then mein sochra hu ki ek variable bana luga jaha pe
// waiting player rahega, jaise hi koi dusra player connects, match them automatically, easy and good
// mtlb 2 chiz, 1 for waiting players and another for active rooms

let waitingPlayer: WaitingPlayer = {
  player: null,
  roomId: null
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

      if(!type){
        ws.send(JSON.stringify({
          message: "Konsa game kheloge"
        }))
      }
  
      if(type == "PLAY_CONNECT_4"){
  
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
  
          // start the game
          room.players.forEach((player)=> {
            player.send(JSON.stringify({
              message: "Game starting, aajao fas fas"
            }))
          })
          
          return;
        }
  
        const roomId = generateRoomId();
  
        rooms.set(roomId, {
          players: [ws]
        })
  
        waitingPlayer.player = ws;
        waitingPlayer.roomId = roomId;
  
        ws.send(JSON.stringify({
          message: "Waiting for someone to join"
        }));
        
        return;
      }
    }catch(error){
      ws.send(JSON.stringify({
        message: "Goli beta, masti nahi"
      }))
    }

    ws.on("close", () => {
      if(waitingPlayer.player != null){
        waitingPlayer.player = null;
        waitingPlayer.roomId = null;
      }
    })

    })
  }
)

console.log("WebSocket server running on ws://localhost:8080");
