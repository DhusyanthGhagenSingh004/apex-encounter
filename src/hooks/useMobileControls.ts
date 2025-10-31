import { useState, useCallback } from 'react';

export interface JoystickInput {
  x: number;
  y: number;
}

export const useMobileControls = () => {
  const [joystickInput, setJoystickInput] = useState<JoystickInput>({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);

  const handleJoystickMove = useCallback((x: number, y: number) => {
    setJoystickInput({ x, y });
  }, []);

  const handleShootStart = useCallback(() => {
    setIsShooting(true);
  }, []);

  const handleShootEnd = useCallback(() => {
    setIsShooting(false);
  }, []);

  return {
    joystickInput,
    isShooting,
    handleJoystickMove,
    handleShootStart,
    handleShootEnd,
  };
};
