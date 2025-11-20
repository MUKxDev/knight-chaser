"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameSocket } from "../../../hooks/useGameSocket";
import GameInfo from "../../../components/GameInfo";
import Board from "../../../components/Board";
import GameRules from "../../../components/GameRules";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { HelpCircle } from "lucide-react";
import { TextShimmer } from "../../../../components/motion-primitives/text-shimmer";

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

  const connectingToRoomText = useMemo(() => {
    return `Connecting to room ${roomId}...`;
  }, [roomId]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <TextShimmer className="font-mono text-lg" duration={1}>
          {connectingToRoomText}
        </TextShimmer>
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
      <div className="flex-1 flex flex-col items-center justify-center w-full pb-8 px-4 gap-8">
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-colors border border-gray-700">
              <HelpCircle size={20} />
              <span>How to Play</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-900 border-gray-700 text-white p-0 overflow-hidden">
            <GameRules className="border-0 bg-transparent" />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
