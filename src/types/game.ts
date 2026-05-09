export type Position = {
  x: number;
  y: number;
};

export type PlayerId = "p1" | "p2";

export type GameStatus = "playing" | "p1_wins" | "p2_wins";

export type Mode = "easy" | "hardcore";

export interface GameState {
  p1Pos: Position;
  p2Pos: Position;
  unavailableSquares: string[]; // serialized "x,y"
  currentPlayer: PlayerId;
  status: GameStatus;
  p1Mode: Mode;
  p2Mode: Mode;
  powerupsMode: boolean;
  blitzMode: boolean;
  teleporters: string[]; // serialized "x,y"
  restores: string[]; // serialized "x,y"
  turnStartTime?: number; // timestamp
}

export const INITIAL_STATE: GameState = {
  p1Pos: { x: 0, y: 0 },
  p2Pos: { x: 5, y: 8 },
  unavailableSquares: ["0,0", "5,8"],
  currentPlayer: "p1",
  status: "playing",
  p1Mode: "hardcore",
  p2Mode: "hardcore",
  powerupsMode: false,
  blitzMode: false,
  teleporters: [],
  restores: [],
};
