import { useEffect } from 'react';
import { useRoute } from 'wouter';
import { GameBoard } from '@/components/chess-board';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

export default function GamePage() {
  const [match, params] = useRoute('/game/:id');
  const gameId = params?.id || '';

  if (!match) return <div>Game not found</div>;

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      {/* Game Header */}
      <header className="h-16 border-b border-white/10 bg-background/80 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-xl font-bold tracking-wide">
            GAME <span className="text-primary">#{gameId.split('-')[1] || '---'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <GameBoard gameId={gameId} />
      </main>
    </div>
  );
}
