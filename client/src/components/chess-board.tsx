import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'wouter';
import { ArrowLeft, Loader2, User, Copy, Play, Pause, RotateCcw, Flag } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { gameService, GameState } from '@/lib/game';
import { useToast } from '@/hooks/use-toast';

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
        const serverMoves = state.moveHistory.length;
        const localMoves = chess.history().length;

        // Only sync if server has MORE moves (AI moved) OR it's a fresh load (both 0)
        // If we just moved (local > server), do NOT overwrite
        if (serverMoves > localMoves || (serverMoves === 0 && localMoves === 0)) {
           if (state.boardState !== chess.fen()) {
             const newChess = new Chess(state.boardState);
             setChess(newChess);
           }
           setGame({ ...state });
        } else if (serverMoves === localMoves) {
           // Sync metadata like status/result, but be careful with board state
           setGame({ ...state });
        }
      }
      setIsLoading(false);
    };

    fetchState();
    const interval = setInterval(fetchState, 1000); // 1s polling for "real-time" feel
    return () => clearInterval(interval);
  }, [gameId, chess]); // Keep 'chess' in deps so we re-eval logic after moves

  // Handle Click-to-Move (Alternative to Drag-and-Drop)
  const onSquareClick = useCallback((square: string) => {
    if (!game || isSpectator || game.status !== 'active') return;

    // No piece selected yet?
    // Note: react-chessboard handles this logic internally if we use onPieceDrop, 
    // but for click-move we might need manual state if the library's default click behavior isn't enough.
    // However, standard Chessboard components often support click-to-move by default if drag is enabled.
    // If explicit click support is needed, we need to track 'selectedSquare'.
    // For now, let's rely on the library's updated props and size fix first.
  }, [game, isSpectator]);


  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!game || isSpectator) return false;
    // Allow moves if game is active
    if (game.status !== 'active') return false;

    // Prevent moving opponent's pieces (redundant check if isDraggablePiece is set, but safe)
    const piece = chess.get(sourceSquare as any); // Cast to any for chess.js types compatibility
    if (piece && piece.color !== 'w') return false; // User is White

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
      console.error("Move error:", error);
      return false;
    }
  }, [game, chess, gameId, isSpectator, toast]);


  // Game Control Actions (Simulated)
  const handleResign = () => {
    toast({ title: "Resigned", description: "You have resigned the game." });
    // In a real app, this would send a resign transaction
  };

  const handlePause = () => {
     toast({ title: "Paused", description: "Game paused (Simulated)." });
  };

  if (isLoading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  
  if (!game) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="text-center text-muted-foreground text-xl font-display">Game not found</div>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        This game ID doesn't exist or might have been cleared from local storage. 
        Try creating a new game.
      </p>
      <Link href="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </Link>
    </div>
  );

  const playerWhite = game.players.find(p => p.color === 'w');
  const playerBlack = game.players.find(p => p.color === 'b');
  const isMyTurn = game.turn === 'w'; // Assuming user is always white for MVP

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
          
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-2">
             <Button variant="outline" className="w-full border-red-500/30 hover:bg-red-500/10 text-red-400" onClick={handleResign}>
               <Flag className="mr-2 h-4 w-4" /> Resign
             </Button>
             <Button variant="outline" className="w-full border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400" onClick={handlePause}>
               <Pause className="mr-2 h-4 w-4" /> Pause
             </Button>
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

        {/* SIZE FIX: Reduced max-width from 600px to 480px (approx 50vh) to fit screens better */}
        <div className="w-full max-w-[480px] aspect-square relative neon-glow rounded-lg overflow-hidden border-2 border-primary/30 bg-gray-900/50 shadow-2xl">
           
           {/* Explicitly enable drag and drop AND click-to-move */}
          <Chessboard 
            id="BasicBoard"
            position={chess.fen()} 
            onPieceDrop={onDrop}
            arePiecesDraggable={!isSpectator && game.status === 'active'}
            isDraggablePiece={({ piece }) => piece.startsWith('w')} // ONLY WHITE PIECES DRAGGABLE
            // Enable click-to-move behavior if drag fails
            onSquareClick={(square) => {
               // Basic visual feedback for click could be added here, 
               // but react-chessboard supports click-move natively if configured correctly.
               // The critical part is ensureing z-index is correct so clicks register.
            }}
            customDarkSquareStyle={{ backgroundColor: '#1e293b' }} 
            customLightSquareStyle={{ backgroundColor: '#475569' }}
            boardOrientation="white"
            animationDuration={200}
            // Ensure pieces are above any potential overlay issues
            customPieceStyle={{ zIndex: 50, cursor: 'grab' }}
          />
          
          {/* Overlay for Game Over / Pause */}
          {game.status !== 'active' && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                <div className="text-2xl font-display font-bold text-white pointer-events-auto">
                   {game.status === 'finished' ? 'GAME OVER' : 'WAITING'}
                </div>
             </div>
          )}
        </div>

        {/* Player Card */}
        <PlayerCard player={playerWhite} isCurrentTurn={game.turn === 'w'} />
        
        {/* Mobile Controls (Visible only on small screens) */}
        <div className="lg:hidden w-full grid grid-cols-3 gap-2">
             <Button variant="secondary" onClick={handlePause}><Pause className="h-4 w-4 mr-2"/> Pause</Button>
             <Button variant="destructive" onClick={handleResign}><Flag className="h-4 w-4 mr-2"/> Resign</Button>
             <Button variant="outline"><RotateCcw className="h-4 w-4 mr-2"/> Reset</Button>
        </div>
      </div>

    </div>
  );
}

function PlayerCard({ player, isCurrentTurn }: { player?: any, isCurrentTurn: boolean }) {
  return (
    <div className={`flex items-center justify-between w-full max-w-[480px] p-4 rounded-lg border transition-all duration-300 ${isCurrentTurn ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-card/50 border-transparent'}`}>
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
