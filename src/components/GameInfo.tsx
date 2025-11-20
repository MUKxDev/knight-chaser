import React, { useState } from "react";
import { GameState, PlayerId, Mode } from "../types/game";
import { Switch } from "./ui/switch";

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
    <>
      <div className="flex gap-2 p-4 absolute top-4 items-center justify-between w-full">
        <div className=" text-gray-400">
          <div className="flex items-center gap-2 mb-1">
            <p>Room ID:</p>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors text-gray-400 hover:text-white"
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
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
          <p>
            You are:{" "}
            <span className="text-amber-400 font-bold">
              {myPlayerId === "p1" ? "Player 1 (White)" : "Player 2 (Black)"}
            </span>
          </p>
          <p>
            Opponent:{" "}
            {opponentConnected ? (
              <>
                <span className="text-green-400">Connected</span>
                <span className="text-gray-500 text-xs ml-2">
                  ({myPlayerId === "p1" ? gameState.p2Mode : gameState.p1Mode})
                </span>
              </>
            ) : (
              <span className="text-yellow-400">Waiting...</span>
            )}
          </p>
          {myPlayerId && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">Hardcore Mode:</span>
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
          className="  px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          onClick={onLeave}
        >
          Leave Room
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-amber-400">Knight Chaser</h1>

      <div className="mb-4 text-xl">
        {gameState.status === "playing" ? (
          <span
            className={
              gameState.currentPlayer === myPlayerId
                ? "text-green-400 font-bold"
                : "text-gray-400"
            }
          >
            {gameState.currentPlayer === myPlayerId
              ? "Your Turn"
              : "Opponent's Turn"}
          </span>
        ) : (
          <span className="text-green-400 font-bold">
            Game Over!{" "}
            {gameState.status === "p1_wins" ? "Player 1" : "Player 2"} Wins!
            <button
              onClick={onRestart}
              className="ml-4 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
            >
              Play Again
            </button>
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 text-red-400 bg-red-900/20 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Board will be rendered here by parent */}

      <div className="mt-6 text-gray-400 text-sm max-w-md text-center">
        <p>
          Rules: Move in L-shapes. Squares you leave become unavailable. Capture
          the opponent or block them from moving to win.
        </p>
      </div>
    </>
  );
}
