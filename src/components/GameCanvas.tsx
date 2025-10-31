import { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const {
    player,
    enemies,
    bullets,
    safeZone,
    weapons,
    gameState,
    keys,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handleMouseDown,
    handlePickupWeapon,
    restartGame,
  } = useGameLoop(canvasRef, gameStarted);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#1a2e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw safe zones
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(safeZone.nextX, safeZone.nextY, safeZone.nextRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(safeZone.x, safeZone.y, safeZone.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw weapons
      weapons.forEach(weapon => {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(weapon.x - 8, weapon.y - 8, 16, 16);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(weapon.x - 8, weapon.y - 8, 16, 16);
      });

      // Draw enemies
      enemies.forEach(enemy => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Enemy health bar
        const healthWidth = 30;
        const healthHeight = 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x - healthWidth / 2, enemy.y - 25, healthWidth, healthHeight);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(enemy.x - healthWidth / 2, enemy.y - 25, (enemy.health / 100) * healthWidth, healthHeight);
      });

      // Draw bullets
      bullets.forEach(bullet => {
        ctx.fillStyle = bullet.isPlayerBullet ? '#fbbf24' : '#ef4444';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -10);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();

      // Player health bar
      const healthWidth = 40;
      const healthHeight = 6;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(player.x - healthWidth / 2, player.y - 30, healthWidth, healthHeight);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(player.x - healthWidth / 2, player.y - 30, (player.health / 100) * healthWidth, healthHeight);
    };

    const animate = () => {
      render();
      requestAnimationFrame(animate);
    };

    animate();
  }, [player, enemies, bullets, safeZone, weapons, gameStarted]);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {!gameStarted ? (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/95">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold text-foreground tracking-wider">BATTLE ROYALE</h1>
            <p className="text-xl text-muted-foreground">Last one standing wins</p>
            <div className="space-y-2 text-muted-foreground">
              <p>WASD - Move</p>
              <p>Mouse - Aim & Shoot</p>
              <p>E - Pick up weapons</p>
            </div>
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold text-xl rounded-lg hover:bg-primary/90 transition-colors mt-8"
            >
              DROP IN
            </button>
          </div>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="w-full h-full cursor-crosshair"
          />
          
          <GameHUD
            health={player.health}
            ammo={player.ammo}
            maxAmmo={player.maxAmmo}
            weapon={player.weapon}
            eliminations={gameState.eliminations}
            alive={gameState.alive}
            safeZoneTimer={gameState.safeZoneTimer}
          />

          {(gameState.status === 'victory' || gameState.status === 'defeat') && (
            <GameOver
              status={gameState.status}
              eliminations={gameState.eliminations}
              onRestart={() => {
                restartGame();
                setGameStarted(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
