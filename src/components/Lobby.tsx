import React, { useState } from "react";
import GameRules from "./GameRules";
import { TextScramble } from "../../components/motion-primitives/text-scramble";

interface LobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export default function Lobby({ onCreateRoom, onJoinRoom }: LobbyProps) {
  const [inputRoomId, setInputRoomId] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
      <TextScramble
        duration={1.5}
        className="text-3xl md:text-4xl font-bold mb-8 text-amber-400"
      >
        Knight Chaser
      </TextScramble>
      <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg text-center">
        <p className="mb-4 text-gray-300">Welcome to the Mejlas</p>

        <button
          onClick={onCreateRoom}
          className="w-full mb-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded font-bold"
        >
          Create New Room
        </button>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
            placeholder="Enter Room ID"
            className="px-4 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-amber-500 outline-none w-full"
          />
          <button
            onClick={() => onJoinRoom(inputRoomId)}
            disabled={!inputRoomId}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold disabled:opacity-50 w-full sm:w-auto"
          >
            Join
          </button>
        </div>

        <div className="mt-8">
          <GameRules className="bg-gray-900/30" />
        </div>
      </div>
    </div>
  );
}
