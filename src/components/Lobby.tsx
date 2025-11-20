import React, { useState } from "react";

interface LobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export default function Lobby({ onCreateRoom, onJoinRoom }: LobbyProps) {
  const [inputRoomId, setInputRoomId] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
      <h1 className="text-4xl font-bold mb-8 text-amber-400">Knight Chaser</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <p className="mb-4 text-gray-300">Welcome to the Lobby</p>

        <button
          onClick={onCreateRoom}
          className="w-full mb-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded font-bold"
        >
          Create New Room
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
            placeholder="Enter Room ID"
            className="px-4 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-amber-500 outline-none"
          />
          <button
            onClick={() => onJoinRoom(inputRoomId)}
            disabled={!inputRoomId}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold disabled:opacity-50"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
