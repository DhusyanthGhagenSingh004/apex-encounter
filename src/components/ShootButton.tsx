import { Crosshair } from 'lucide-react';

interface ShootButtonProps {
  onShootStart: () => void;
  onShootEnd: () => void;
}

export const ShootButton = ({ onShootStart, onShootEnd }: ShootButtonProps) => {
  return (
    <button
      className="fixed bottom-8 right-8 w-24 h-24 bg-game-danger/80 rounded-full border-4 border-white/50 z-50 flex items-center justify-center active:bg-game-danger active:scale-95 transition-all shadow-lg"
      onTouchStart={(e) => {
        e.preventDefault();
        onShootStart();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onShootEnd();
      }}
      onMouseDown={onShootStart}
      onMouseUp={onShootEnd}
      onMouseLeave={onShootEnd}
      style={{ touchAction: 'none' }}
    >
      <Crosshair className="w-12 h-12 text-white" strokeWidth={3} />
    </button>
  );
};
