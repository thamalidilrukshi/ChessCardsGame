import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

// Types matching the PRD concept
export interface Player {
  wallet: string;
  color: 'w' | 'b';
  seatId: number;
  name?: string; // Mock name
}

export interface GameState {
  gameId: string;
  players: Player[];
  turn: 'w' | 'b';
  boardState: string; // FEN
  moveHistory: string[];
  status: 'waiting' | 'active' | 'finished';
  result?: 'win' | 'loss' | 'draw';
  lastMoveAt: number;
}

// Mock Data Store
let MOCK_GAMES: Record<string, GameState> = {
  'game-demo': {
    gameId: 'game-demo',
    players: [
      { wallet: '0x789...xyz', color: 'w', seatId: 0, name: 'You' },
    ],
    turn: 'w',
    boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moveHistory: [],
    status: 'waiting',
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

  // Create a new game (mock transaction)
  createGame: async (wallet: string): Promise<string> => {
    const id = `game-${Math.floor(Math.random() * 10000)}`;
    MOCK_GAMES[id] = {
      gameId: id,
      players: [{ wallet, color: 'w', seatId: 0, name: 'You' }],
      turn: 'w',
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moveHistory: [],
      status: 'waiting',
      lastMoveAt: Date.now(),
    };
    saveGames();
    return new Promise((resolve) => setTimeout(() => resolve(id), 800)); // Simulate network lag
  },

  // Join a game
  joinGame: async (gameId: string, wallet: string): Promise<boolean> => {
    const game = MOCK_GAMES[gameId];
    if (!game || game.status !== 'waiting') return false;
    
    // Avoid duplicate join
    if (game.players.some(p => p.wallet === wallet)) return true;

    game.players.push({ wallet, color: 'b', seatId: 1, name: 'Opponent' });
    game.status = 'active';
    saveGames();
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
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

      // Update state
      game.boardState = chess.fen();
      game.turn = chess.turn();
      game.moveHistory.push(move.san);
      game.lastMoveAt = Date.now();

      if (chess.isGameOver()) {
        game.status = 'finished';
        game.result = chess.isDraw() ? 'draw' : 'win'; // Simplified
      }
      
      saveGames();
      return new Promise((resolve) => setTimeout(() => resolve(true), 300)); // Fast microchain update
    } catch (e) {
      return false;
    }
  },

  // List all games
  listGames: async (): Promise<GameState[]> => {
    return Object.values(MOCK_GAMES);
  }
};
