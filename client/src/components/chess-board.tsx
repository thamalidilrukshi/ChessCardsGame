import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { gameService, GameState } from '@/lib/game';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Copy } from 'lucide-react';

interface GameBoardProps {
  gameId: string;
  isSpectator?: boolean;
}

export function GameBoard({ gameId, isSpectator = false }: GameBoardProps) {
  const [game, setGame] = useState<GameState | null>(null);
  const [chess, setChess] = useState(new Chess());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Poll for game state (simulating subscription to microchain events)
  useEffect(() => {
    const fetchState = () => {
      const state = gameService.getGameState(gameId);
      if (state) {
        // Only update if FEN changed to avoid jitter
        if (state.boardState !== chess.fen()) {
          const newChess = new Chess(state.boardState);
          setChess(newChess);
        }
        setGame({ ...state });
      }
      setIsLoading(false);
    };

    fetchState();
    const interval = setInterval(fetchState, 1000); // 1s polling for "real-time" feel
    return () => clearInterval(interval);
  }, [gameId, chess]);

  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!game || isSpectator) return false;
    if (game.status !== 'active') return false;

    // Optimistic update
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    };

    try {
      const tempChess = new Chess(chess.fen());
      const result = tempChess.move(move);
      
      if (!result) return false; // Illegal move
      
      setChess(tempChess); // Update UI immediately

      // Send to "chain"
      gameService.submitMove(gameId, sourceSquare, targetSquare)
        .catch(() => {
          // Rollback on failure
          setChess(new Chess(game.boardState));
          toast({
            title: "Move Failed",
            description: "Transaction rejected by microchain.",
            variant: "destructive"
          });
        });

      return true;
    } catch (error) {
      return false;
    }
  }, [game, chess, gameId, isSpectator, toast]);

  if (isLoading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!game) return <div className="text-center text-muted-foreground">Game not found</div>;

  const playerWhite = game.players.find(p => p.color === 'w');
  const playerBlack = game.players.find(p => p.color === 'b');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
      
      {/* Left Panel: Game Info & Chat */}
      <div className="hidden lg:flex flex-col gap-4">
        <Card className="p-6 glass-panel border-primary/20">
          <h2 className="text-xl font-display mb-4 text-primary">Match Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Game ID</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono">{game.gameId}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${game.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {game.status.toUpperCase()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex-1 glass-panel border-primary/20 min-h-[300px]">
          <h2 className="text-xl font-display mb-4 text-primary">Move History</h2>
          <div className="h-[200px] overflow-y-auto pr-2 font-mono text-sm space-y-1">
            {game.moveHistory.map((move, i) => (
              <div key={i} className="flex justify-between border-b border-white/5 py-1">
                <span className="text-muted-foreground w-8">{Math.floor(i/2) + 1}.</span>
                <span className={i % 2 === 0 ? "text-white" : "text-muted-foreground"}>{move}</span>
              </div>
            ))}
            {game.moveHistory.length === 0 && <div className="text-muted-foreground italic">No moves yet</div>}
          </div>
        </Card>
      </div>

      {/* Center: Board */}
      <div className="flex flex-col items-center justify-center gap-6 col-span-2">
        
        {/* Opponent Card */}
        <PlayerCard player={playerBlack} isCurrentTurn={game.turn === 'b'} />

        <div className="w-full max-w-[600px] aspect-square relative neon-glow rounded-lg overflow-hidden border-2 border-primary/30">
          <Chessboard 
            position={chess.fen()} 
            onPieceDrop={onDrop}
            customDarkSquareStyle={{ backgroundColor: '#1e293b' }} // slate-800
            customLightSquareStyle={{ backgroundColor: '#475569' }} // slate-600
            boardOrientation="white"
          />
        </div>

        {/* Player Card */}
        <PlayerCard player={playerWhite} isCurrentTurn={game.turn === 'w'} />
      </div>

    </div>
  );
}

function PlayerCard({ player, isCurrentTurn }: { player?: any, isCurrentTurn: boolean }) {
  return (
    <div className={`flex items-center justify-between w-full max-w-[600px] p-4 rounded-lg border transition-all duration-300 ${isCurrentTurn ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-card/50 border-transparent'}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <User className="text-white h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-sm">{player?.name || 'Waiting for opponent...'}</div>
          <div className="text-xs font-mono text-muted-foreground truncate w-32">{player?.wallet || '---'}</div>
        </div>
      </div>
      <div className={`text-2xl font-mono font-bold ${isCurrentTurn ? 'text-white' : 'text-muted-foreground'}`}>
        10:00
      </div>
    </div>
  );
}
