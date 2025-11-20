import React from "react";
import { GameState, PlayerId, Position } from "../types/game";
import { getValidMoves, posToString, BOARD_SIZE } from "../utils/gameLogic";
import { WhiteKnight, BlackKnight } from "./Knights";

interface BoardProps {
  gameState: GameState;
  myPlayerId: PlayerId | null;
  onCellClick: (x: number, y: number) => void;
}

export default function Board({
  gameState,
  myPlayerId,
  onCellClick,
}: BoardProps) {
  const getCellStyle = (x: number, y: number) => {
    const posStr = posToString({ x, y });
    const isUnavailable = gameState.unavailableSquares.includes(posStr);
    const isP1 = posToString(gameState.p1Pos) === posStr;
    const isP2 = posToString(gameState.p2Pos) === posStr;

    let baseClass =
      "w-full h-full flex items-center justify-center border border-emerald-700 transition-colors duration-200";

    // Checkerboard pattern
    const isDark = (x + y) % 2 === 1;
    let bgClass = isDark ? "bg-emerald-800" : "bg-emerald-200";

    if (isUnavailable && !isP1 && !isP2) {
      bgClass = "bg-gray-800"; // Visited/Unavailable
    }

    // Highlight valid moves for current player (only in easy mode)
    if (
      myPlayerId &&
      gameState.currentPlayer === myPlayerId &&
      gameState.status === "playing"
    ) {
      const myMode = myPlayerId === "p1" ? gameState.p1Mode : gameState.p2Mode;

      // Only show valid moves in easy mode
      if (myMode === "easy") {
        const currentPos =
          myPlayerId === "p1" ? gameState.p1Pos : gameState.p2Pos;
        const validMoves = getValidMoves(currentPos, gameState);
        const isValidMove = validMoves.some((m) => m.x === x && m.y === y);
        if (isValidMove) {
          bgClass = "bg-emerald-500 animate-pulse duration-500 cursor-pointer ";
        }
      }
    }

    return `${baseClass} ${bgClass}`;
  };

  const isP1Loser = gameState.status === "p2_wins";
  const isP2Loser = gameState.status === "p1_wins";

  return (
    <div
      className="relative border-4 border-emerald-600 mx-auto shadow-2xl shadow-black/50 rounded-lg"
      style={{
        width: "min(90vw, 600px, 65vh)",
        height: "min(90vw, 600px, 65vh)",
      }}
    >
      {/* Grid Layer */}
      <div className="grid grid-cols-8 grid-rows-8 gap-0 w-full h-full">
        {Array.from({ length: BOARD_SIZE }).map((_, y) =>
          Array.from({ length: BOARD_SIZE }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className={getCellStyle(x, y)}
              onClick={() => onCellClick(x, y)}
            />
          ))
        )}
      </div>

      {/* Knights Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Player 1 (White) */}
        <div
          className={`absolute w-[12.5%] h-[12.5%] flex items-center justify-center transition-all duration-300 ease-in-out ${
            gameState.currentPlayer === "p1" && myPlayerId === "p1"
              ? "animate-bounce"
              : ""
          } ${isP1Loser ? "animate-fly-up-out z-50" : ""}`}
          style={{
            left: `${gameState.p1Pos.x * 12.5}%`,
            top: `${gameState.p1Pos.y * 12.5}%`,
          }}
        >
          <WhiteKnight />
        </div>

        {/* Player 2 (Black) */}
        <div
          className={`absolute w-[12.5%] h-[12.5%] flex items-center justify-center transition-all duration-300 ease-in-out ${
            gameState.currentPlayer === "p2" && myPlayerId === "p2"
              ? "animate-bounce"
              : ""
          } ${isP2Loser ? "animate-fly-up-out z-50" : ""}`}
          style={{
            left: `${gameState.p2Pos.x * 12.5}%`,
            top: `${gameState.p2Pos.y * 12.5}%`,
          }}
        >
          <BlackKnight />
        </div>
      </div>
    </div>
  );
}
