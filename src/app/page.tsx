"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Lobby from "@/components/Lobby";

export default function Home() {
  const router = useRouter();

  const handleCreateRoom = (options: { powerupsMode: boolean; blitzMode: boolean; easyMode: boolean }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/rooms/${roomId}?powerups=${options.powerupsMode}&blitz=${options.blitzMode}&easy=${options.easyMode}`);
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <main>
      <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
    </main>
  );
}
