"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameSocket } from "../../../hooks/useGameSocket";
import GameInfo from "../../../components/GameInfo";
import Board from "../../../components/Board";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  if (!roomId) return <div>Invalid Room ID</div>;

  const {
    gameState,
    myPlayerId,
    isConnected,
    error,
    opponentConnected,
    connect,
    moveKnight,
    restartGame,
    changeMode,
  } = useGameSocket();

  useEffect(() => {
    if (roomId) {
      connect(roomId);
    }
  }, [roomId, connect]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Connecting to room {roomId}...</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-start pt-4 min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
      <GameInfo
        roomId={roomId}
        myPlayerId={myPlayerId}
        opponentConnected={opponentConnected}
        gameState={gameState}
        error={error}
        onRestart={restartGame}
        onLeave={() => router.push("/")}
        onModeChange={changeMode}
      />
      <div className="flex-1 flex items-center justify-center w-full pb-8 px-4">
        <Board
          gameState={gameState}
          myPlayerId={myPlayerId}
          onCellClick={(x, y) => {
            if (!myPlayerId || gameState.status !== "playing") return;
            if (gameState.currentPlayer !== myPlayerId) return;

            const currentPos =
              myPlayerId === "p1" ? gameState.p1Pos : gameState.p2Pos;
            moveKnight(currentPos, { x, y });
          }}
        />
      </div>
    </div>
  );
}
