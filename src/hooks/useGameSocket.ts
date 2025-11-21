import { useState, useEffect, useRef, useCallback } from "react";
import {
  GameState,
  INITIAL_STATE,
  PlayerId,
  Position,
  Mode,
} from "../types/game";

export const useGameSocket = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [myPlayerId, setMyPlayerId] = useState<PlayerId | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectingRef = useRef(false);

  const connect = useCallback((targetRoomId: string) => {
    if (socketRef.current || connectingRef.current) return;

    connectingRef.current = true;

    const socketInitializer = async () => {
      try {
        await fetch("/api/socket");

        // Get or create userId synchronously
        let userId = sessionStorage.getItem("knight_chaser_user_id");
        if (!userId) {
          userId =
            Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem("knight_chaser_user_id", userId);
        }

        const ws = new WebSocket(
          window.location.origin.replace(/^http/, "ws") + "/api/game_ws"
        );

        ws.onopen = () => {
          console.log("Connected to WebSocket");
          setIsConnected(true);
          connectingRef.current = false;

          // Auto-join the room upon connection
          ws.send(
            JSON.stringify({ type: "JOIN_ROOM", roomId: targetRoomId, userId })
          );
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "ROOM_JOINED") {
            setRoomId(data.roomId);
            setMyPlayerId(data.playerId);
            setGameState(data.gameState);
            setError(null);
            if (data.playerId === "p2") setOpponentConnected(true);
          } else if (data.type === "PLAYER_JOINED") {
            setOpponentConnected(true);
            setError(null);
          } else if (data.type === "STATE_UPDATE") {
            setGameState(data.gameState);
          } else if (data.type === "ERROR") {
            setError(data.message);
            if (errorTimeoutRef.current) {
              clearTimeout(errorTimeoutRef.current);
            }
            errorTimeoutRef.current = setTimeout(() => {
              setError(null);
              errorTimeoutRef.current = null;
            }, 2000);
          } else if (data.type === "OPPONENT_DISCONNECTED") {
            setError("Opponent disconnected");
            setOpponentConnected(false);
          }
        };

        ws.onclose = () => {
          console.log("Disconnected");
          setIsConnected(false);
          socketRef.current = null;
          connectingRef.current = false;
        };

        socketRef.current = ws;
      } catch (e) {
        console.error("Socket initialization failed", e);
        connectingRef.current = false;
      }
    };

    socketInitializer();
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const moveKnight = useCallback((from: Position, to: Position) => {
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "MOVE",
          moveFrom: from,
          moveTo: to,
        })
      );
    }
  }, []);

  const restartGame = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "RESTART_GAME" }));
    }
  }, []);

  const changeMode = useCallback((mode: Mode) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "MODE_CHANGE", mode }));
    }
  }, []);

  return {
    gameState,
    myPlayerId,
    roomId,
    isConnected,
    error,
    opponentConnected,
    connect,
    moveKnight,
    restartGame,
    changeMode,
  };
};
