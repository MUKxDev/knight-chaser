import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { WebSocket, WebSocketServer } from "ws";
import {
  GameState,
  INITIAL_STATE,
  PlayerId,
  GameStatus,
} from "../../types/game";
import { getValidMoves, posToString } from "../../utils/gameLogic";

interface GameRoom {
  id: string;
  gameState: GameState;
  players: {
    p1?: WebSocket;
    p2?: WebSocket;
  };
  playerIds: {
    p1?: string;
    p2?: string;
  };
  cleanupTimeout?: NodeJS.Timeout;
}

// Global state to persist across hot reloads in dev (mostly)
// In production, this would be in an external store if persistence was needed.
// For this task, in-memory is specified.
declare global {
  var rooms: Map<string, GameRoom>;
  var wss: WebSocketServer | undefined;
}

if (!global.rooms) {
  global.rooms = new Map();
}

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if ((res.socket as any).server.wss) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  console.log("Socket is initializing");
  const httpServer: NetServer = (res.socket as any).server;
  const wss = new WebSocketServer({ server: httpServer, path: "/api/game_ws" });
  (res.socket as any).server.wss = wss;
  global.wss = wss;

  wss.on("connection", (ws) => {
    console.log("New client connected");
    let currentRoomId: string | null = null;
    let myPlayerId: PlayerId | null = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "CREATE_ROOM") {
          const roomId = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          const room: GameRoom = {
            id: roomId,
            gameState: JSON.parse(JSON.stringify(INITIAL_STATE)),
            players: { p1: ws },
            playerIds: {},
          };
          global.rooms.set(roomId, room);
          currentRoomId = roomId;
          myPlayerId = "p1";

          ws.send(
            JSON.stringify({
              type: "ROOM_JOINED",
              roomId,
              playerId: "p1",
              gameState: room.gameState,
            })
          );
        } else if (data.type === "JOIN_ROOM") {
          const { roomId, userId } = data; // Expect userId
          let room = global.rooms.get(roomId);

          // If room doesn't exist, create it
          if (!room) {
            room = {
              id: roomId,
              gameState: JSON.parse(JSON.stringify(INITIAL_STATE)),
              players: { p1: ws },
              playerIds: { p1: userId },
            };
            global.rooms.set(roomId, room);
            currentRoomId = roomId;
            myPlayerId = "p1";
            console.log(`Created new room: ${roomId} with player 1: ${userId}`);

            ws.send(
              JSON.stringify({
                type: "ROOM_JOINED",
                roomId,
                playerId: "p1",
                gameState: room.gameState,
              })
            );
            return;
          }

          // Clear any pending cleanup since someone is interacting with the room
          if (room.cleanupTimeout) {
            console.log(`Cancelling cleanup for room ${roomId}`);
            clearTimeout(room.cleanupTimeout);
            delete room.cleanupTimeout;
          }

          // 1. Check if this user is already in the room (Reconnect)
          if (room.playerIds.p1 === userId) {
            room.players.p1 = ws; // Update socket
            currentRoomId = roomId;
            myPlayerId = "p1";
            ws.send(
              JSON.stringify({
                type: "ROOM_JOINED",
                roomId,
                playerId: "p1",
                gameState: room.gameState,
              })
            );
            // Notify p2
            if (
              room.players.p2 &&
              room.players.p2.readyState === WebSocket.OPEN
            ) {
              room.players.p2.send(
                JSON.stringify({ type: "PLAYER_JOINED", playerId: "p1" })
              );
            }
            return;
          }
          if (room.playerIds.p2 === userId) {
            room.players.p2 = ws; // Update socket
            currentRoomId = roomId;
            myPlayerId = "p2";
            ws.send(
              JSON.stringify({
                type: "ROOM_JOINED",
                roomId,
                playerId: "p2",
                gameState: room.gameState,
              })
            );
            // Notify p1
            if (
              room.players.p1 &&
              room.players.p1.readyState === WebSocket.OPEN
            ) {
              room.players.p1.send(
                JSON.stringify({ type: "PLAYER_JOINED", playerId: "p2" })
              );
            }
            return;
          }

          // 2. Join as new player
          // Try to join as P1 first
          if (
            !room.players.p1 ||
            room.players.p1.readyState !== WebSocket.OPEN
          ) {
            room.players.p1 = ws;
            room.playerIds.p1 = userId;
            currentRoomId = roomId;
            myPlayerId = "p1";
            ws.send(
              JSON.stringify({
                type: "ROOM_JOINED",
                roomId,
                playerId: "p1",
                gameState: room.gameState,
              })
            );

            // Notify p2 if they are there
            if (
              room.players.p2 &&
              room.players.p2.readyState === WebSocket.OPEN
            ) {
              room.players.p2.send(
                JSON.stringify({ type: "PLAYER_JOINED", playerId: "p1" })
              );
            }
          }
          // Then try P2
          else if (
            !room.players.p2 ||
            room.players.p2.readyState !== WebSocket.OPEN
          ) {
            room.players.p2 = ws;
            room.playerIds.p2 = userId;
            currentRoomId = roomId;
            myPlayerId = "p2";
            ws.send(
              JSON.stringify({
                type: "ROOM_JOINED",
                roomId,
                playerId: "p2",
                gameState: room.gameState,
              })
            );

            // Notify p1
            if (
              room.players.p1 &&
              room.players.p1.readyState === WebSocket.OPEN
            ) {
              room.players.p1.send(
                JSON.stringify({ type: "PLAYER_JOINED", playerId: "p2" })
              );
            }
          } else {
            ws.send(JSON.stringify({ type: "ERROR", message: "Room is full" }));
          }
        } else if (data.type === "MOVE") {
          if (!currentRoomId || !myPlayerId) return;
          const room = global.rooms.get(currentRoomId);
          if (!room) return;

          const { moveFrom, moveTo } = data; // Expecting { x, y } objects

          // 1. Check turn
          if (room.gameState.currentPlayer !== myPlayerId) {
            ws.send(
              JSON.stringify({ type: "ERROR", message: "Not your turn" })
            );
            return;
          }

          // 2. Validate Move (Server-side authority)
          const currentPos =
            myPlayerId === "p1" ? room.gameState.p1Pos : room.gameState.p2Pos;
          // Verify the move is from the current position (basic sanity check)
          if (currentPos.x !== moveFrom.x || currentPos.y !== moveFrom.y) {
            ws.send(
              JSON.stringify({ type: "ERROR", message: "Invalid move origin" })
            );
            return;
          }

          const validMoves = getValidMoves(currentPos, room.gameState);
          const isValid = validMoves.some(
            (m) => m.x === moveTo.x && m.y === moveTo.y
          );

          if (!isValid) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Invalid move" }));
            return;
          }

          // 3. Execute Move
          const nextPlayer =
            room.gameState.currentPlayer === "p1" ? "p2" : "p1";
          const moveFromStr = posToString(moveFrom);
          const moveToStr = posToString(moveTo);
          const opponentPos =
            room.gameState.currentPlayer === "p1"
              ? room.gameState.p2Pos
              : room.gameState.p1Pos;
          const opponentPosStr = posToString(opponentPos);

          let nextStatus: GameStatus = "playing";

          // Check Capture
          if (moveToStr === opponentPosStr) {
            nextStatus =
              room.gameState.currentPlayer === "p1" ? "p1_wins" : "p2_wins";
          }

          // Update State
          room.gameState = {
            ...room.gameState,
            p1Pos:
              room.gameState.currentPlayer === "p1"
                ? moveTo
                : room.gameState.p1Pos,
            p2Pos:
              room.gameState.currentPlayer === "p2"
                ? moveTo
                : room.gameState.p2Pos,
            unavailableSquares: [
              ...room.gameState.unavailableSquares,
              moveFromStr,
            ],
            currentPlayer: nextPlayer,
            status: nextStatus,
          };

          // Check Stalemate (for the NEXT player)
          if (nextStatus === "playing") {
            const nextPlayerPos =
              nextPlayer === "p1" ? room.gameState.p1Pos : room.gameState.p2Pos;
            const nextPlayerMoves = getValidMoves(
              nextPlayerPos,
              room.gameState
            );
            if (nextPlayerMoves.length === 0) {
              nextStatus = nextPlayer === "p2" ? "p1_wins" : "p2_wins";
              room.gameState.status = nextStatus;
            }
          }

          // 4. Broadcast
          const updateMsg = JSON.stringify({
            type: "STATE_UPDATE",
            gameState: room.gameState,
          });
          if (room.players.p1 && room.players.p1.readyState === WebSocket.OPEN)
            room.players.p1.send(updateMsg);
          if (room.players.p2 && room.players.p2.readyState === WebSocket.OPEN)
            room.players.p2.send(updateMsg);
        } else if (data.type === "RESTART_GAME") {
          console.log("Restarting game for room:", currentRoomId);
          if (!currentRoomId) return;
          const room = global.rooms.get(currentRoomId);
          if (!room) return;

          // Reset Game State
          room.gameState = JSON.parse(JSON.stringify(INITIAL_STATE));

          // Broadcast new state
          const updateMsg = JSON.stringify({
            type: "STATE_UPDATE",
            gameState: room.gameState,
          });
          if (room.players.p1 && room.players.p1.readyState === WebSocket.OPEN)
            room.players.p1.send(updateMsg);
          if (room.players.p2 && room.players.p2.readyState === WebSocket.OPEN)
            room.players.p2.send(updateMsg);
        } else if (data.type === "MODE_CHANGE") {
          if (!currentRoomId || !myPlayerId) return;
          const room = global.rooms.get(currentRoomId);
          if (!room) return;

          const { mode } = data; // Expecting 'easy' or 'hardcore'

          // Update the mode for the current player
          if (myPlayerId === "p1") {
            room.gameState.p1Mode = mode;
          } else {
            room.gameState.p2Mode = mode;
          }

          // Broadcast updated state to both players
          const updateMsg = JSON.stringify({
            type: "STATE_UPDATE",
            gameState: room.gameState,
          });
          if (room.players.p1 && room.players.p1.readyState === WebSocket.OPEN)
            room.players.p1.send(updateMsg);
          if (room.players.p2 && room.players.p2.readyState === WebSocket.OPEN)
            room.players.p2.send(updateMsg);
        }
      } catch (e) {
        console.error("Error processing message", e);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      // Handle cleanup if needed (e.g., notify opponent)
      if (currentRoomId && myPlayerId) {
        const room = global.rooms.get(currentRoomId);
        if (room) {
          const opponentId = myPlayerId === "p1" ? "p2" : "p1";
          const opponentWs = room.players[opponentId];
          if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
            opponentWs.send(JSON.stringify({ type: "OPPONENT_DISCONNECTED" }));
          }

          // Check if both players are disconnected
          const isP1Active =
            room.players.p1 && room.players.p1.readyState === WebSocket.OPEN;
          const isP2Active =
            room.players.p2 && room.players.p2.readyState === WebSocket.OPEN;

          if (!isP1Active && !isP2Active) {
            console.log(
              `Room ${currentRoomId} is empty. Scheduling cleanup in 30s.`
            );
            room.cleanupTimeout = setTimeout(() => {
              if (global.rooms.has(currentRoomId!)) {
                global.rooms.delete(currentRoomId!);
                console.log(`Room ${currentRoomId} deleted due to inactivity.`);
              }
            }, 30000); // 30 seconds grace period
          }
        }
      }
    });
  });

  res.end();
}
