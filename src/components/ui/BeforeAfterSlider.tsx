import React, { useState, useRef, useCallback } from 'react';

export interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Hail & Wind Damage (Pre-Audit)',
  afterLabel = 'Completed Master Elite Replacement',
  beforeAlt = 'Roof with severe hail fractures and wind-torn shingles',
  afterAlt = 'Completed architectural shingle roof restoration',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX);
      }
    },
    [updatePosition]
  );

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      className={`relative select-none overflow-hidden rounded-2xl bg-slate-950 aspect-[16/10] ${className}`}
    >
      {/* After image (Background full width) */}
      <img
        src={afterImage}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />

      {/* Before image (Clipped via clipPath) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <img
          src={beforeImage}
          alt={beforeAlt}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Scrim overlay for damage image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-10 bg-rose-950/80 text-rose-200 border border-rose-800 px-2.5 py-1 rounded text-[11px] font-mono font-bold">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 z-10 bg-emerald-950/80 text-emerald-200 border border-emerald-800 px-2.5 py-1 rounded text-[11px] font-mono font-bold">
        {afterLabel}
      </div>

      {/* Vertical divider line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-2xl"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle grip button */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparison slider between damage audit and completed restoration"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-slate-900 flex items-center justify-center cursor-ew-resize focus:outline-none focus:ring-4 focus:ring-amber-500/50"
        >
          <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 3 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Instruction indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-3 py-1 rounded-full pointer-events-none">
        Drag or use arrow keys (← / →) to inspect forensic differences
      </div>
    </div>
  );
};
