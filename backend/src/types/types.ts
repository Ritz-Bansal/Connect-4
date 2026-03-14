import WebSocket from "ws";

export interface Room {
  players: WebSocket[];
}


export interface WaitingPlayer {
  player: WebSocket | null;
  roomId: string | null;
}