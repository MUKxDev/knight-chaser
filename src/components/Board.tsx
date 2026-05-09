import React from "react";
import { GameState, PlayerId, Position } from "../types/game";
import { getValidMoves, posToString, BOARD_COLS, BOARD_ROWS } from "../utils/gameLogic";
import { WhiteKnight, BlackKnight } from "./Knights";
import { motion, AnimatePresence } from "motion/react";

interface BoardProps {
  gameState: GameState;
  myPlayerId: PlayerId | null;
  onCellClick: (x: number, y: number) => void;
  opponentConnected: boolean;
}

export default function Board({
  gameState,
  myPlayerId,
  onCellClick,
  opponentConnected,
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
    if (x === 0 && y === 0) {
      baseClass += " rounded-tl-sm";
    }
    if (x === BOARD_COLS - 1 && y === 0) {
      baseClass += " rounded-tr-sm";
    }
    if (x === 0 && y === BOARD_ROWS - 1) {
      baseClass += " rounded-bl-sm";
    }
    if (x === BOARD_COLS - 1 && y === BOARD_ROWS - 1) {
      baseClass += " rounded-br-sm";
    }

    // Highlight valid moves for current player (only in easy mode)
    if (
      myPlayerId &&
      gameState.currentPlayer === myPlayerId &&
      gameState.status === "playing" &&
      opponentConnected
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
      className="relative border-2 md:border-4 border-emerald-600 mx-auto shadow-2xl shadow-black/50 rounded-lg"
      style={{
        width: "min(90vw, 600px, 65vh)",
        height: "min(90vw, 600px, 65vh)",
      }}
    >
      {/* Grid Layer */}
      <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${BOARD_ROWS}, minmax(0, 1fr))` }}>
        {Array.from({ length: BOARD_ROWS }).map((_, y) =>
          Array.from({ length: BOARD_COLS }).map((_, x) => {
            const posStr = posToString({ x, y });
            const isUnavailable = gameState.unavailableSquares.includes(posStr);
            const isP1 = posToString(gameState.p1Pos) === posStr;
            const isP2 = posToString(gameState.p2Pos) === posStr;
            const isVisible = !isUnavailable || isP1 || isP2;
            const isTeleporter = gameState.teleporters?.includes(posStr);
            const isRestore = gameState.restores?.includes(posStr);

            return (
              <div key={`${x}-${y}`} className="w-full h-full relative">
                <AnimatePresence>
                  {isVisible && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0, y: 30 }}
                      transition={{ duration: 0.4 }}
                      className={getCellStyle(x, y)}
                      onClick={() => opponentConnected && onCellClick(x, y)}
                    >
                      {isTeleporter && <div className="absolute w-4 h-4 bg-sky-400 rounded-full shadow-[0_0_12px_4px_rgba(56,189,248,0.8)] animate-pulse" />}
                      {isRestore && <div className="absolute text-2xl animate-bounce">✨</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Knights Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Player 1 (White) */}
        <div
          className={`absolute flex items-center justify-center transition-all duration-300 ease-in-out ${
            gameState.currentPlayer === "p1" &&
            myPlayerId === "p1" &&
            opponentConnected
              ? "animate-bounce"
              : ""
          } ${isP1Loser ? "animate-fly-up-out z-50" : ""}`}
          style={{
            width: `${100 / BOARD_COLS}%`,
            height: `${100 / BOARD_ROWS}%`,
            left: `${gameState.p1Pos.x * (100 / BOARD_COLS)}%`,
            top: `${gameState.p1Pos.y * (100 / BOARD_ROWS)}%`,
          }}
        >
          <WhiteKnight />
        </div>

        {/* Player 2 (Black) */}
        <div
          className={`absolute flex items-center justify-center transition-all duration-300 ease-in-out ${
            gameState.currentPlayer === "p2" &&
            myPlayerId === "p2" &&
            opponentConnected
              ? "animate-bounce"
              : ""
          } ${isP2Loser ? "animate-fly-up-out z-50" : ""}`}
          style={{
            width: `${100 / BOARD_COLS}%`,
            height: `${100 / BOARD_ROWS}%`,
            left: `${gameState.p2Pos.x * (100 / BOARD_COLS)}%`,
            top: `${gameState.p2Pos.y * (100 / BOARD_ROWS)}%`,
          }}
        >
          <BlackKnight />
        </div>
      </div>

      {/* Waiting Overlay */}
      {!opponentConnected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-sm">
          <div className="bg-gray-900 p-6 rounded-lg border border-amber-500/50 shadow-xl text-center max-w-[80%]">
            <h3 className="text-xl font-bold text-amber-400 mb-2">
              Waiting for Opponent
            </h3>
            <p className="text-gray-400 text-sm">
              Share the room ID to start playing!
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
