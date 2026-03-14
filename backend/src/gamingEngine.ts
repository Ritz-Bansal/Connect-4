import type { Room } from "./types/types";

export function create_board(){
    const rows = 6;
    const cols = 7;

    const board: string[][] = [];

    for(let i=0; i<rows; i++){
        board[i] = new Array(cols).fill(".");
    }

    return board;
}

export function gamingEngine(room: Room, column: number, turn: number){
    column--; // normalizing column to 0, user 1-indexed bhejega, we want 0-indexed
    if(isFull(room)){
        return {
            message: "Draw"
        }
    }

    if(!canPlace(room, column)){
        return {
            message: "Incorrect inputs"
        }
    }

    const row = room.rowIdx[column]!;
    const symbol = turn === 0 ? "RED" : "YELLOW";
    room.board[row]![column] = symbol;
    
    room.rowIdx[column] = room.rowIdx[column]! - 1;
    room.counter++;

    if(hasWon(room, symbol, row, column)){
        return { 
            message: `Player ${turn+1} has won`,
            move: { row, column, color: symbol }
         };
    }

    if(isFull(room)) {
        return { 
            message: "Draw",
            move: { row, column, color: symbol }
        };
    }
    
    return { 
        nextTurn: turn === 0 ? 1 : 0,
        move: { row, column, color: symbol }
    };
}

// TC - O(1), iterate karne pe O(N) hogi TC inki
function canPlace(room: Room, column: number){
    if (column < 0 || column >= 7) {
        return false;
    }
    if(room.rowIdx[column] == -1){
        return false;
    }
    return true;
}

function isFull(room: Room){
    if(room.counter < 42){  // total cells 7*6
        return false;
    }

    return true;
}

// yeh sab deltas hai
const directions = [
    [[0,1], [0,-1]], //left, right
    [[-1,0], [1,0]], //top, niche
    [[-1,-1], [1, 1]], //upar, niche
    [[-1,1], [1,-1]] //ipar, niche
];

function hasWon(room: Room, symbol: string, row: number, col: number){
    for(let i=0; i<4; i++){
        const count1 = f(row, col, directions[i]![0]!, symbol, room) - 1;
        const count2 = f(row, col, directions[i]![1]!, symbol, room) - 1;
        
        if(count1+count2+1 >= 4){
            return true;
        }
    }

    return false;
}

function f(row: number, col: number, direction: number[], symbol: string, room: Room){
    let counter = 0;
    while(isValid(row, col)){
        if(room.board[row]![col] == symbol){
            counter++;
            row += direction[0]!;
            col += direction[1]!;
        }else{
            break;
        }
    }

    return counter;
}

function isValid(row: number, col: number){
    if(row >= 0 && row < 6 && col >= 0 && col < 7){
        return true;
    }
    return false;
}