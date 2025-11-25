import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { gameService, GameState } from '@/lib/game';
import { Zap, Cpu, Shield, Play, Plus } from 'lucide-react';
import heroImage from '@assets/generated_images/futuristic_abstract_chess_pieces_floating_in_a_digital_blockchain_void.png';

export default function Home() {
  const [games, setGames] = useState<GameState[]>([]);
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    gameService.listGames().then(setGames);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    const address = await gameService.connectWallet();
    setWallet(address);
    setIsConnecting(false);
  };

  const handleCreateGame = async () => {
    if (!wallet) {
      handleConnect();
      return;
    }
    setIsCreating(true);
    const id = await gameService.createGame(wallet);
    setLocation(`/game/${id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Navigation */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold tracking-wider neon-text">FLASHCHAIN</span>
          </div>
          <Button 
            variant="outline" 
            className={`font-mono border-primary/50 ${wallet ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : wallet || 'Connect Wallet'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="FlashChain Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>
        
        <div className="container relative z-10 text-center space-y-6 px-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 drop-shadow-sm">
            REAL-TIME ON-CHAIN
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Play Chess with instant finality on Linera microchains. 
            Zero lag. Fully decentralized.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-lg shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all hover:scale-105"
              onClick={handleCreateGame}
              disabled={isCreating}
            >
              {isCreating ? 'Initializing Chain...' : 'New Game'} <Plus className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="secondary" className="h-14 text-lg bg-secondary text-background hover:bg-secondary/90">
              Watch Replays <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Cpu className="h-8 w-8 text-secondary" />}
            title="Microchain Architecture"
            description="Each game runs on its own dedicated microchain for unlimited scalability."
          />
          <FeatureCard 
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Instant Finality"
            description="Moves are confirmed in milliseconds. No waiting for block times."
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8 text-pink-500" />}
            title="Verifiable Fairness"
            description="Smart contracts enforce rules and prevent cheating on-chain."
          />
        </div>
      </section>

      {/* Active Games List */}
      <section className="py-12 bg-black/20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full" />
            Lobby
          </h2>

          <div className="grid gap-4">
            {games.map((game) => (
              <Card key={game.gameId} className="glass-panel border-white/5 hover:border-primary/50 transition-colors group">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10">
                      <span className="font-display text-lg text-muted-foreground">#{game.gameId.split('-')[1]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{game.players[0].name} vs {game.players[1]?.name || 'Waiting...'}</h3>
                      <p className="text-sm text-muted-foreground font-mono">Last move: {new Date(game.lastMoveAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant={game.status === 'waiting' ? 'default' : 'secondary'}
                    onClick={() => setLocation(`/game/${game.gameId}`)}
                    className="w-32"
                  >
                    {game.status === 'waiting' ? 'Join Game' : 'Spectate'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card/40 border-white/5 backdrop-blur-sm hover:bg-card/60 transition-colors">
      <CardHeader>
        <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit">{icon}</div>
        <CardTitle className="font-display text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
