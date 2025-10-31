import { Crosshair, Heart, Target } from 'lucide-react';

interface GameHUDProps {
  health: number;
  ammo: number;
  maxAmmo: number;
  weapon: string;
  eliminations: number;
  alive: number;
  safeZoneTimer: number;
}

export const GameHUD = ({
  health,
  ammo,
  maxAmmo,
  weapon,
  eliminations,
  alive,
  safeZoneTimer,
}: GameHUDProps) => {
  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 items-center">
        <div className="bg-card/90 backdrop-blur px-6 py-3 rounded-lg border border-border flex items-center gap-3">
          <Target className="w-5 h-5 text-secondary" />
          <span className="text-foreground font-bold text-lg">{eliminations}</span>
          <span className="text-muted-foreground text-sm">ELIMINATIONS</span>
        </div>
        
        <div className="bg-card/90 backdrop-blur px-6 py-3 rounded-lg border border-border flex items-center gap-3">
          <Crosshair className="w-5 h-5 text-primary" />
          <span className="text-foreground font-bold text-lg">{alive}</span>
          <span className="text-muted-foreground text-sm">ALIVE</span>
        </div>

        <div className="bg-card/90 backdrop-blur px-6 py-3 rounded-lg border border-border">
          <div className="text-muted-foreground text-sm">SAFE ZONE</div>
          <div className="text-foreground font-bold text-xl">{Math.ceil(safeZoneTimer / 60)}s</div>
        </div>
      </div>

      {/* Bottom Left - Health */}
      <div className="absolute bottom-8 left-8 space-y-3">
        <div className="bg-card/90 backdrop-blur px-6 py-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-destructive" />
            <span className="text-muted-foreground text-sm">HEALTH</span>
          </div>
          <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-game-safe transition-all duration-300"
              style={{ width: `${health}%` }}
            />
          </div>
          <div className="text-foreground font-bold text-2xl mt-1">{health}</div>
        </div>
      </div>

      {/* Bottom Right - Weapon & Ammo */}
      <div className="absolute bottom-8 right-8 space-y-3">
        <div className="bg-card/90 backdrop-blur px-6 py-4 rounded-lg border border-border text-right">
          <div className="text-primary font-bold text-xl mb-2">{weapon}</div>
          <div className="text-foreground font-bold text-4xl">
            {ammo}
            <span className="text-muted-foreground text-xl">/{maxAmmo}</span>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-8 h-8">
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-foreground -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-foreground -translate-x-1/2" />
          <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-foreground -translate-y-1/2" />
          <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-foreground -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-foreground/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </>
  );
};
