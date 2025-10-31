import { Package } from 'lucide-react';

interface MobileActionButtonProps {
  onAction: () => void;
  visible: boolean;
  label?: string;
}

export const MobileActionButton = ({ onAction, visible, label = 'Pick Up' }: MobileActionButtonProps) => {
  if (!visible) return null;

  return (
    <button
      className="fixed top-1/2 right-8 -translate-y-1/2 px-6 py-4 bg-primary/90 rounded-lg border-2 border-white/50 z-50 flex items-center gap-2 active:bg-primary active:scale-95 transition-all shadow-lg"
      onTouchStart={(e) => {
        e.preventDefault();
        onAction();
      }}
      onClick={onAction}
      style={{ touchAction: 'none' }}
    >
      <Package className="w-6 h-6 text-white" />
      <span className="text-white font-bold text-lg">{label}</span>
    </button>
  );
};
