import { useState, useEffect, useCallback, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface Player {
  x: number;
  y: number;
  health: number;
  angle: number;
  speed: number;
  weapon: string;
  ammo: number;
  maxAmmo: number;
  lastShot: number;
  fireRate: number;
}

interface Enemy {
  x: number;
  y: number;
  health: number;
  lastShot: number;
  targetX: number;
  targetY: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayerBullet: boolean;
}

interface SafeZone {
  x: number;
  y: number;
  radius: number;
  nextX: number;
  nextY: number;
  nextRadius: number;
}

interface Weapon {
  x: number;
  y: number;
  type: string;
  ammo: number;
  fireRate: number;
}

interface GameState {
  eliminations: number;
  alive: number;
  status: 'playing' | 'victory' | 'defeat';
  safeZoneTimer: number;
}

export const useGameLoop = (
  canvasRef: React.RefObject<HTMLCanvasElement>, 
  gameStarted: boolean,
  joystickInput?: { x: number; y: number },
  isShooting?: boolean
) => {
  const [player, setPlayer] = useState<Player>({
    x: 600,
    y: 400,
    health: 100,
    angle: 0,
    speed: 3,
    weapon: 'PISTOL',
    ammo: 50,
    maxAmmo: 50,
    lastShot: 0,
    fireRate: 300,
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [safeZone, setSafeZone] = useState<SafeZone>({
    x: 600,
    y: 400,
    radius: 350,
    nextX: 600,
    nextY: 400,
    nextRadius: 250,
  });

  const [gameState, setGameState] = useState<GameState>({
    eliminations: 0,
    alive: 10,
    status: 'playing',
    safeZoneTimer: 600,
  });

  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const mousePos = useRef({ x: 0, y: 0 });

  const initGame = useCallback(() => {
    // Spawn enemies
    const newEnemies: Enemy[] = [];
    for (let i = 0; i < 9; i++) {
      newEnemies.push({
        x: Math.random() * 1100 + 50,
        y: Math.random() * 700 + 50,
        health: 100,
        lastShot: 0,
        targetX: Math.random() * 1200,
        targetY: Math.random() * 800,
      });
    }
    setEnemies(newEnemies);

    // Spawn weapons
    const newWeapons: Weapon[] = [];
    const weaponTypes = [
      { type: 'RIFLE', ammo: 100, fireRate: 150 },
      { type: 'SMG', ammo: 120, fireRate: 100 },
      { type: 'SHOTGUN', ammo: 30, fireRate: 800 },
    ];
    
    for (let i = 0; i < 5; i++) {
      const weapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
      newWeapons.push({
        x: Math.random() * 1100 + 50,
        y: Math.random() * 700 + 50,
        ...weapon,
      });
    }
    setWeapons(newWeapons);
  }, []);

  useEffect(() => {
    if (gameStarted && enemies.length === 0) {
      initGame();
    }
  }, [gameStarted, initGame, enemies.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    mousePos.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [canvasRef]);

  const snapToNearestEnemy = useCallback((playerAngle: number, playerX: number, playerY: number): number => {
    const aimConeAngle = Math.PI / 4; // 45 degrees
    const maxAimDistance = 300;
    
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = maxAimDistance;

    enemies.forEach(enemy => {
      const distance = Math.hypot(enemy.x - playerX, enemy.y - playerY);
      if (distance > maxAimDistance) return;

      const angleToEnemy = Math.atan2(enemy.y - playerY, enemy.x - playerX);
      const angleDiff = Math.abs(angleToEnemy - playerAngle);

      if (angleDiff < aimConeAngle && distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    });

    if (nearestEnemy) {
      const targetAngle = Math.atan2(nearestEnemy.y - playerY, nearestEnemy.x - playerX);
      return playerAngle * 0.6 + targetAngle * 0.4; // 40% aim assist
    }

    return playerAngle;
  }, [enemies]);

  const handleMouseDown = useCallback(() => {
    if (gameState.status !== 'playing') return;
    
    setPlayer(prev => {
      const now = Date.now();
      if (now - prev.lastShot < prev.fireRate || prev.ammo <= 0) return prev;

      let angle = Math.atan2(mousePos.current.y - prev.y, mousePos.current.x - prev.x);
      
      // Apply auto-aim for mobile
      if (isShooting) {
        angle = snapToNearestEnemy(angle, prev.x, prev.y);
      }

      const speed = 8;

      setBullets(b => [
        ...b,
        {
          x: prev.x,
          y: prev.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          isPlayerBullet: true,
        },
      ]);

      // Haptic feedback on mobile
      try {
        Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available
      }

      return { ...prev, ammo: prev.ammo - 1, lastShot: now };
    });
  }, [gameState.status, isShooting, snapToNearestEnemy]);

  const handlePickupWeapon = useCallback(() => {
    setWeapons(prev => {
      const nearbyWeapon = prev.find(
        w => Math.hypot(w.x - player.x, w.y - player.y) < 30
      );

      if (nearbyWeapon) {
        setPlayer(p => ({
          ...p,
          weapon: nearbyWeapon.type,
          ammo: nearbyWeapon.ammo,
          maxAmmo: nearbyWeapon.ammo,
          fireRate: nearbyWeapon.fireRate,
        }));

        return prev.filter(w => w !== nearbyWeapon);
      }

      return prev;
    });
  }, [player.x, player.y]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        handlePickupWeapon();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handlePickupWeapon]);

  const restartGame = useCallback(() => {
    setPlayer({
      x: 600,
      y: 400,
      health: 100,
      angle: 0,
      speed: 3,
      weapon: 'PISTOL',
      ammo: 50,
      maxAmmo: 50,
      lastShot: 0,
      fireRate: 300,
    });
    setEnemies([]);
    setBullets([]);
    setWeapons([]);
    setSafeZone({
      x: 600,
      y: 400,
      radius: 350,
      nextX: 600,
      nextY: 400,
      nextRadius: 250,
    });
    setGameState({
      eliminations: 0,
      alive: 10,
      status: 'playing',
      safeZoneTimer: 600,
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameState.status !== 'playing') return;

    const interval = setInterval(() => {
      // Update player position
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;

        // Mobile joystick input
        if (joystickInput && (joystickInput.x !== 0 || joystickInput.y !== 0)) {
          newX += joystickInput.x * prev.speed;
          newY += joystickInput.y * prev.speed;
        } else {
          // Desktop keyboard input
          if (keys['w']) newY -= prev.speed;
          if (keys['s']) newY += prev.speed;
          if (keys['a']) newX -= prev.speed;
          if (keys['d']) newX += prev.speed;
        }

        newX = Math.max(20, Math.min(1180, newX));
        newY = Math.max(20, Math.min(780, newY));

        const angle = Math.atan2(mousePos.current.y - newY, mousePos.current.x - newX);

        return { ...prev, x: newX, y: newY, angle };
      });

      // Mobile continuous shooting
      if (isShooting) {
        handleMouseDown();
      }

      // Update enemies
      setEnemies(prev => {
        return prev.map(enemy => {
          const distToTarget = Math.hypot(enemy.targetX - enemy.x, enemy.targetY - enemy.y);
          
          if (distToTarget < 10) {
            return {
              ...enemy,
              targetX: Math.random() * 1200,
              targetY: Math.random() * 800,
            };
          }

          const angle = Math.atan2(enemy.targetY - enemy.y, enemy.targetX - enemy.x);
          const newX = enemy.x + Math.cos(angle) * 1.5;
          const newY = enemy.y + Math.sin(angle) * 1.5;

          // Enemy shooting
          const now = Date.now();
          const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
          
          if (distToPlayer < 300 && now - enemy.lastShot > 1000) {
            const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            setBullets(b => [
              ...b,
              {
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angleToPlayer) * 6,
                vy: Math.sin(angleToPlayer) * 6,
                isPlayerBullet: false,
              },
            ]);

            return { ...enemy, x: newX, y: newY, lastShot: now };
          }

          return { ...enemy, x: newX, y: newY };
        });
      });

      // Update bullets
      setBullets(prev => {
        return prev
          .map(bullet => ({
            ...bullet,
            x: bullet.x + bullet.vx,
            y: bullet.y + bullet.vy,
          }))
          .filter(bullet => 
            bullet.x > 0 && bullet.x < 1200 && 
            bullet.y > 0 && bullet.y < 800
          );
      });

      // Check bullet collisions
      setBullets(prev => {
        const remainingBullets = [...prev];

        prev.forEach(bullet => {
          if (bullet.isPlayerBullet) {
            setEnemies(enemies => {
              return enemies.filter(enemy => {
                const hit = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < 20;
                if (hit) {
                  const bulletIndex = remainingBullets.indexOf(bullet);
                  if (bulletIndex > -1) remainingBullets.splice(bulletIndex, 1);
                  
                  const newHealth = enemy.health - 34;
                  if (newHealth <= 0) {
                    setGameState(g => ({
                      ...g,
                      eliminations: g.eliminations + 1,
                      alive: g.alive - 1,
                    }));
                    // Haptic feedback on kill
                    try {
                      Haptics.impact({ style: ImpactStyle.Medium });
                    } catch (e) {
                      // Haptics not available
                    }
                    return false;
                  }
                  enemy.health = newHealth;
                }
                return true;
              });
            });
          } else {
            const hit = Math.hypot(bullet.x - player.x, bullet.y - player.y) < 20;
            if (hit) {
              const bulletIndex = remainingBullets.indexOf(bullet);
              if (bulletIndex > -1) remainingBullets.splice(bulletIndex, 1);
              
              setPlayer(p => {
                const newHealth = p.health - 10;
                if (newHealth <= 0) {
                  setGameState(g => ({ ...g, status: 'defeat' }));
                  return { ...p, health: 0 };
                }
                return { ...p, health: newHealth };
              });
            }
          }
        });

        return remainingBullets;
      });

      // Update safe zone
      setGameState(prev => {
        const newTimer = prev.safeZoneTimer - 1;
        
        if (newTimer <= 0) {
          setSafeZone(zone => ({
            ...zone,
            x: zone.nextX,
            y: zone.nextY,
            radius: zone.nextRadius,
            nextX: 600 + (Math.random() - 0.5) * 200,
            nextY: 400 + (Math.random() - 0.5) * 200,
            nextRadius: Math.max(150, zone.nextRadius - 50),
          }));

          return { ...prev, safeZoneTimer: 600 };
        }

        return { ...prev, safeZoneTimer: newTimer };
      });

      // Check if player is outside safe zone
      const distFromCenter = Math.hypot(player.x - safeZone.x, player.y - safeZone.y);
      if (distFromCenter > safeZone.radius) {
        setPlayer(p => {
          const newHealth = p.health - 0.5;
          if (newHealth <= 0) {
            setGameState(g => ({ ...g, status: 'defeat' }));
            return { ...p, health: 0 };
          }
          return { ...p, health: newHealth };
        });
      }

      // Check victory condition
      if (enemies.length === 0 && gameState.alive <= 1) {
        setGameState(g => ({ ...g, status: 'victory' }));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameStarted, keys, player.x, player.y, enemies.length, gameState.status, gameState.alive, safeZone, joystickInput, isShooting, handleMouseDown]);

  return {
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
  };
};
