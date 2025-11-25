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
const MOCK_GAMES: Record<string, GameState> = {
  'game-1': {
    gameId: 'game-1',
    players: [
      { wallet: '0x123...abc', color: 'w', seatId: 0, name: 'Alice' },
      { wallet: '0x456...def', color: 'b', seatId: 1, name: 'Bob' },
    ],
    turn: 'w',
    boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moveHistory: [],
    status: 'active',
    lastMoveAt: Date.now(),
  },
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

// Simulation of Linera Microchain interactions
export const gameService = {
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
    return new Promise((resolve) => setTimeout(() => resolve(id), 800)); // Simulate network lag
  },

  // Join a game
  joinGame: async (gameId: string, wallet: string): Promise<boolean> => {
    const game = MOCK_GAMES[gameId];
    if (!game || game.status !== 'waiting') return false;
    
    game.players.push({ wallet, color: 'b', seatId: 1, name: 'Opponent' });
    game.status = 'active';
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
