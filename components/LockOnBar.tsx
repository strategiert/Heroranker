import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LockOnBarProps {
  onFire: (isCritical: boolean) => void;
  difficulty?: number; // 1-10, affects sweet spot size and speed
  disabled?: boolean;
}

export function LockOnBar({ onFire, difficulty = 1, disabled = false }: LockOnBarProps) {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<'hit' | 'miss' | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Difficulty Config
  // Sweet spot gets smaller with difficulty (min 10%)
  const sweetSpotSize = Math.max(10, 30 - difficulty * 1.5); 
  const sweetSpotStart = 50 - sweetSpotSize / 2;
  const sweetSpotEnd = 50 + sweetSpotSize / 2;

  // Speed Logic: Base speed + scaling
  // Speed is units per ms. 0.1 means 100 units in 1000ms (1s).
  const speed = 0.08 + (difficulty * 0.015);

  const directionRef = useRef(1);
  const positionRef = useRef(0);

  const runLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = Math.min(timestamp - lastTimeRef.current, 64); // Cap delta to prevent huge jumps on lag
    lastTimeRef.current = timestamp;

    // Calculate new position
    const move = directionRef.current * speed * delta;
    let newPos = positionRef.current + move;

    // Bounce Logic (Ping Pong)
    if (newPos >= 100) {
      newPos = 100;
      directionRef.current = -1;
    } else if (newPos <= 0) {
      newPos = 0;
      directionRef.current = 1;
    }

    positionRef.current = newPos;
    setCursorPosition(newPos); // Sync to React State for render

    animationRef.current = requestAnimationFrame(runLoop);
  }, [speed]);

  const startAnimation = useCallback(() => {
    if (disabled) return;
    setIsRunning(true);
    setResult(null);
    lastTimeRef.current = 0;
    // Random start direction
    directionRef.current = Math.random() > 0.5 ? 1 : -1;
    animationRef.current = requestAnimationFrame(runLoop);
  }, [runLoop, disabled]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const handleFire = useCallback(() => {
    if (!isRunning || disabled) return;
    
    stopAnimation();
    
    // Check hit based on Ref (most accurate current position)
    const currentPos = positionRef.current;
    const isCritical = currentPos >= sweetSpotStart && currentPos <= sweetSpotEnd;
    setResult(isCritical ? 'hit' : 'miss');
    
    // Delay before calling onFire for visual feedback
    setTimeout(() => {
      onFire(isCritical);
      setResult(null);
    }, 600);
  }, [isRunning, sweetSpotStart, sweetSpotEnd, stopAnimation, onFire, disabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full space-y-2">
      {/* Lock-On Bar Container */}
      <div className="relative w-full h-12 bg-gray-950 rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner group">
        
        {/* Tech Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 95%, #3b82f6 95%), linear-gradient(0deg, transparent 95%, #3b82f6 95%)',
            backgroundSize: '10px 10px'
          }}
        />

        {/* Sweet Spot Zone (Target) */}
        <div
          className="absolute top-0 bottom-0 transition-all duration-300 ease-out z-10"
          style={{
            left: `${sweetSpotStart}%`,
            width: `${sweetSpotSize}%`,
            background: result === 'hit' 
              ? 'rgba(34, 197, 94, 0.6)' // Success Green
              : result === 'miss'
              ? 'rgba(239, 68, 68, 0.2)' // Fail Red
              : 'rgba(250, 204, 21, 0.3)', // Target Yellow
            borderLeft: '2px solid rgba(250, 204, 21, 0.8)',
            borderRight: '2px solid rgba(250, 204, 21, 0.8)',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.2) inset'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
             {result === 'hit' && <div className="animate-ping absolute inset-0 bg-green-400 opacity-50 rounded-lg"></div>}
          </div>
        </div>
        
        {/* Moving Cursor (The Red Stripe) */}
        <div
          className="absolute top-0 bottom-0 w-2 bg-red-600 z-20 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
          style={{
            left: `calc(${cursorPosition}% - 4px)`, // Center the w-2 (8px) cursor
            willChange: 'left', // Performance hint
          }}
        >
           <div className="w-full h-full bg-gradient-to-b from-red-400 via-red-600 to-red-800"></div>
        </div>

        {/* Difficulty Indicator */}
        <div className="absolute top-1 right-2 text-[8px] font-mono text-slate-500 z-0">
           DIFFICULTY: {difficulty}
        </div>
      </div>

      {/* Result Text & Controls */}
      <div className="flex gap-2 items-center h-12">
         {result ? (
            <div className={`flex-1 flex items-center justify-center font-black text-lg uppercase italic tracking-wider animate-in zoom-in duration-200 border-2 rounded-xl h-full ${
                result === 'hit' 
                ? 'text-green-400 border-green-500/50 bg-green-900/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                : 'text-red-500 border-red-500/50 bg-red-900/20'
            }`}>
               {result === 'hit' ? 'CRITICAL!' : 'MISS'}
            </div>
         ) : !isRunning ? (
            <button
                onClick={startAnimation}
                disabled={disabled}
                className="flex-1 h-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 active:translate-y-1 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0"
            >
                <span className="animate-pulse">⦿</span> ZIELEN
            </button>
         ) : (
            <button
                onClick={handleFire}
                // Mouse down handler for faster reaction than click
                onMouseDown={handleFire}
                onTouchStart={handleFire}
                className="flex-1 h-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-900/20 active:translate-y-1 transition-all flex items-center justify-center gap-2 border-b-4 border-red-800 active:border-b-0"
            >
                FEUER!
            </button>
         )}
      </div>
    </div>
  );
}