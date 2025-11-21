import React, { useState } from "react";
import { GameState, PlayerId, Mode } from "../types/game";
import { Switch } from "./ui/switch";
import { WhiteKnight, BlackKnight } from "./Knights";

interface GameInfoProps {
  roomId: string;
  myPlayerId: PlayerId | null;
  opponentConnected: boolean;
  gameState: GameState;
  error: string | null;
  onRestart: () => void;
  onLeave: () => void;
  onModeChange: (mode: Mode) => void;
}

export default function GameInfo({
  roomId,
  myPlayerId,
  opponentConnected,
  gameState,
  error,
  onRestart,
  onLeave,
  onModeChange,
}: GameInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-gray-400 flex flex-col gap-2 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm uppercase tracking-wider font-semibold">
                Room:
              </span>
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-gray-700/50 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors group"
                title="Copy Room ID"
              >
                <span className="text-white font-mono font-bold">{roomId}</span>
                {copied ? (
                  <span className="text-green-400 text-xs font-bold">
                    Copied!
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400 group-hover:text-white"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>

            <div className="hidden md:block w-px h-4 bg-gray-600"></div>

            <p className="text-sm">
              You:{" "}
              <span className="text-amber-400 font-bold">
                {myPlayerId === "p1" ? "White" : "Black"}
              </span>
            </p>

            <div className="hidden md:block w-px h-4 bg-gray-600"></div>

            <p className="text-sm">
              Opponent:{" "}
              {opponentConnected ? (
                <>
                  <span className="text-green-400 font-bold">Connected</span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({myPlayerId === "p1" ? gameState.p2Mode : gameState.p1Mode}
                    )
                  </span>
                </>
              ) : (
                <span className="text-yellow-400 font-bold animate-pulse">
                  Waiting...
                </span>
              )}
            </p>
          </div>

          {myPlayerId && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Hardcore Mode</span>
              <Switch
                checked={
                  (myPlayerId === "p1"
                    ? gameState.p1Mode
                    : gameState.p2Mode) === "hardcore"
                }
                onCheckedChange={(checked) =>
                  onModeChange(checked ? "hardcore" : "easy")
                }
              />
            </div>
          )}
        </div>

        <button
          className="w-full md:w-auto px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50 rounded transition-colors text-sm font-medium"
          onClick={onLeave}
        >
          Leave Room
        </button>
      </div>

      {/* Game Status Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-400 tracking-tight">
          Knight Chaser
        </h1>

        <div className="text-xl h-8">
          {gameState.status === "playing" ? (
            <span
              className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${
                gameState.currentPlayer === myPlayerId
                  ? "bg-green-900/30 text-green-400 border border-green-900/50"
                  : "bg-gray-800 text-gray-500 border border-gray-700"
              }`}
            >
              {gameState.currentPlayer === myPlayerId ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Your Turn
                </>
              ) : (
                "Opponent's Turn"
              )}
            </span>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <span className="text-green-400 font-bold text-2xl">
                Game Over!{" "}
                {gameState.status === "p1_wins" ? "Player 1" : "Player 2"} Wins!
              </span>

              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-forwards">
                <div className="w-12 h-12 opacity-50 grayscale">
                  {gameState.status === "p2_wins" ? (
                    <WhiteKnight />
                  ) : (
                    <BlackKnight />
                  )}
                </div>

                <button
                  onClick={onRestart}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-bold transition-all hover:scale-105 shadow-lg shadow-blue-900/20"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-full max-w-md text-center text-red-400 bg-gray-900/90 px-4 py-2 rounded border border-red-900/50 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}
    </div>
  );
}
