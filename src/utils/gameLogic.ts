import { GameState, Position } from '../types/game';

export const BOARD_COLS = 6;
export const BOARD_ROWS = 9;

// Helper to serialize position
export const posToString = (pos: Position) => `${pos.x},${pos.y}`;

// Get all 8 possible L-moves
export const getPossibleKnightMoves = (pos: Position): Position[] => {
    const moves = [
        { x: pos.x + 1, y: pos.y + 2 },
        { x: pos.x + 1, y: pos.y - 2 },
        { x: pos.x - 1, y: pos.y + 2 },
        { x: pos.x - 1, y: pos.y - 2 },
        { x: pos.x + 2, y: pos.y + 1 },
        { x: pos.x + 2, y: pos.y - 1 },
        { x: pos.x - 2, y: pos.y + 1 },
        { x: pos.x - 2, y: pos.y - 1 },
    ];
    return moves;
};

// Filter moves based on board boundaries and unavailability
export const getValidMoves = (pos: Position, currentState: GameState): Position[] => {
    const possible = getPossibleKnightMoves(pos);
    const opponentPos = currentState.currentPlayer === 'p1' ? currentState.p2Pos : currentState.p1Pos;
    const opponentPosStr = posToString(opponentPos);

    return possible.filter((m) => {
        if (m.x < 0 || m.x >= BOARD_COLS || m.y < 0 || m.y >= BOARD_ROWS) return false;

        const mStr = posToString(m);
        // Check if unavailable
        // Exception: Can move to opponent's square (capture)
        if (currentState.unavailableSquares.includes(mStr) && mStr !== opponentPosStr) {
            return false;
        }
        return true;
    });
};
