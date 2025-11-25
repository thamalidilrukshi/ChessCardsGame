// Mock Data Store
let MOCK_GAMES: Record<string, GameState> = {
  'game-demo': {
    gameId: 'game-demo',
    players: [
      { wallet: '0x789...xyz', color: 'w', seatId: 0, name: 'You' },
      { wallet: 'AI-AGENT-001', color: 'b', seatId: 1, name: 'FlashChain AI' },
    ],
    turn: 'w',
    boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moveHistory: [],
    status: 'active',
    lastMoveAt: Date.now(),
  }
};

// Load from LocalStorage if available
try {
  const stored = localStorage.getItem('flashchain_games');
  if (stored) {
    MOCK_GAMES = { ...MOCK_GAMES, ...JSON.parse(stored) };
  }
} catch (e) {
  console.error("Failed to load games from storage", e);
}

const saveGames = () => {
  try {
    localStorage.setItem('flashchain_games', JSON.stringify(MOCK_GAMES));
  } catch (e) {
    console.error("Failed to save games", e);
  }
};

import { Chess } from 'chess.js';

// Simulation of Linera Microchain interactions
export const gameService = {
  // Mock Wallet Connection
  connectWallet: async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
        localStorage.setItem('flashchain_wallet', mockAddress);
        resolve(mockAddress);
      }, 500);
    });
  },

  getWallet: (): string | null => {
    return localStorage.getItem('flashchain_wallet');
  },

  // Create a new game (mock transaction) - INSTANTLY STARTS VS AI
  createGame: async (wallet: string): Promise<string> => {
    const id = `game-${Math.floor(Math.random() * 10000)}`;
    MOCK_GAMES[id] = {
      gameId: id,
      players: [
        { wallet, color: 'w', seatId: 0, name: 'You' },
        { wallet: 'AI-AGENT-001', color: 'b', seatId: 1, name: 'FlashChain AI' }
      ],
      turn: 'w', // Player always white for MVP
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moveHistory: [],
      status: 'active', // Instant start
      lastMoveAt: Date.now(),
    };
    saveGames();
    return new Promise((resolve) => setTimeout(() => resolve(id), 800));
  },

  // Join a game (Legacy/Multiplayer stub)
  joinGame: async (gameId: string, wallet: string): Promise<boolean> => {
    return true; // No-op for AI mode
  },

  // Get Game State
  getGameState: (gameId: string): GameState | null => {
    return MOCK_GAMES[gameId] || null;
  },

  // Submit Move (Signed Action simulation)
  submitMove: async (gameId: string, from: string, to: string, promotion?: string): Promise<boolean> => {
    const game = MOCK_GAMES[gameId];
    if (!game) return false;

    // Validate locally with chess.js
    const chess = new Chess(game.boardState);
    try {
      const move = chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) return false;

      // Update state (Player Move)
      game.boardState = chess.fen();
      game.turn = chess.turn();
      game.moveHistory.push(move.san);
      game.lastMoveAt = Date.now();
      saveGames();

      if (chess.isGameOver()) {
        game.status = 'finished';
        game.result = chess.isDraw() ? 'draw' : 'win';
        saveGames();
        return true;
      }

      // TRIGGER AI MOVE (Simulated Off-Chain Agent)
      if (game.turn === 'b') {
        setTimeout(() => {
           gameService.processAIMove(gameId);
        }, 1500); // Artificial thinking time
      }

      return true;
    } catch (e) {
      return false;
    }
  },

  // AI Logic (Simulated Microchain "Bot" Transaction)
  processAIMove: (gameId: string) => {
    const game = MOCK_GAMES[gameId];
    if (!game || game.status !== 'active') return;

    const chess = new Chess(game.boardState);
    const moves = chess.moves();
    
    if (moves.length > 0) {
      // Simple AI: Random Move (MVP) -> Replace with Minimax if needed
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      chess.move(randomMove);

      // Update State
      game.boardState = chess.fen();
      game.turn = chess.turn();
      game.moveHistory.push(randomMove);
      game.lastMoveAt = Date.now();
      
      if (chess.isGameOver()) {
        game.status = 'finished';
        game.result = chess.isDraw() ? 'draw' : 'loss';
      }
      saveGames();
    }
  },

  // List all games
  listGames: async (): Promise<GameState[]> => {
    return Object.values(MOCK_GAMES);
  }
};
