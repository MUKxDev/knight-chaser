import React from "react";

export default function GameRules({ className = "" }: { className?: string }) {
  return (
    <div
      className={`text-left bg-gray-800/50 p-4 rounded-lg border border-gray-700 ${className}`}
    >
      <h3 className="text-lg font-bold text-amber-400 mb-2">How to Play</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
        <li>Each player controls a knight (White or Black).</li>
        <li>Move your knight in an "L" shape (standard chess moves).</li>
        <li>Squares you land on disappear and cannot be used again.</li>
        <li>
          <strong>Objective:</strong> Capture or Trap your opponent! The first
          player who cannot make a valid move loses.
        </li>
      </ul>
    </div>
  );
}
