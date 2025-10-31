import { Trophy, Skull } from 'lucide-react';

interface GameOverProps {
  status: 'victory' | 'defeat';
  eliminations: number;
  onRestart: () => void;
}

export const GameOver = ({ status, eliminations, onRestart }: GameOverProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-background/95 backdrop-blur">
      <div className="text-center space-y-6 max-w-md">
        {status === 'victory' ? (
          <>
            <Trophy className="w-24 h-24 text-primary mx-auto" />
            <h1 className="text-6xl font-bold text-primary tracking-wider">WINNER!</h1>
            <p className="text-2xl text-foreground">CHICKEN DINNER</p>
          </>
        ) : (
          <>
            <Skull className="w-24 h-24 text-destructive mx-auto" />
            <h1 className="text-6xl font-bold text-destructive tracking-wider">ELIMINATED</h1>
          </>
        )}
        
        <div className="bg-card px-8 py-6 rounded-lg border border-border">
          <div className="text-muted-foreground mb-2">ELIMINATIONS</div>
          <div className="text-foreground font-bold text-5xl">{eliminations}</div>
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-4 bg-primary text-primary-foreground font-bold text-xl rounded-lg hover:bg-primary/90 transition-colors"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
