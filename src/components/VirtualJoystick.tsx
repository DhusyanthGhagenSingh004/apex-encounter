import { useEffect, useRef, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const VirtualJoystick = ({ onMove }: VirtualJoystickProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const maxDistance = 50;

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      e.preventDefault();
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      const limitedDistance = Math.min(distance, maxDistance);
      const angle = Math.atan2(deltaY, deltaX);
      
      const x = Math.cos(angle) * limitedDistance;
      const y = Math.sin(angle) * limitedDistance;
      
      setPosition({ x, y });
      
      // Normalize to -1 to 1
      onMove(x / maxDistance, y / maxDistance);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onMove(0, 0);
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, onMove]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-8 w-32 h-32 bg-white/10 rounded-full border-2 border-white/30 z-50"
      onTouchStart={() => setIsDragging(true)}
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/50 rounded-full border-2 border-white transition-transform"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  );
};
