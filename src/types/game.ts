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
}

export const INITIAL_STATE: GameState = {
  p1Pos: { x: 0, y: 0 },
  p2Pos: { x: 7, y: 7 },
  unavailableSquares: ["0,0", "7,7"],
  currentPlayer: "p1",
  status: "playing",
  p1Mode: "hardcore",
  p2Mode: "hardcore",
};
