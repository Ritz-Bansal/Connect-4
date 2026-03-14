import WebSocket from "ws";

enum Turn {
  first, //0
  second // 1
}

export interface Room {
  players: WebSocket[];
  board: string[][];
  turn: Turn; // 0 means player 1 and 1 means player 2,
  rowIdx: number[];
  counter: number;
}


export interface WaitingPlayer {
  player: WebSocket | null;
  roomId: string | null;
}