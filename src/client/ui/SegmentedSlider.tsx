import React, { useState, useRef } from 'react';

type SliderProps = {
   min?: number;
   max?: number;
   value?: number;
   onChange?: (value: number) => void;
};

export default function SegmentedSlider({
   min = 0,
   max = 10,
   value: controlledValue,
   onChange,
}: SliderProps) {
   const [internalValue, setInternalValue] = useState(min);
   const [isDragging, setIsDragging] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   const value = controlledValue ?? internalValue;

   const setValue = (v: number) => {
      const clamped = Math.max(min, Math.min(max, v));
      setInternalValue(clamped);
      onChange?.(clamped);
   };

   const getIndexFromEvent = (e: MouseEvent | React.MouseEvent) => {
      if (!containerRef.current) return value;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const stepWidth = rect.width / (max - min);
      return min + Math.round(relX / stepWidth);
   };

   const handleMouseDown = (e: React.MouseEvent) => {
      setValue(getIndexFromEvent(e));
      setIsDragging(true);
   };

   React.useEffect(() => {
      if (!isDragging) return;

      const handleMove = (e: MouseEvent) => {
         setValue(getIndexFromEvent(e));
      };
      const handleUp = () => setIsDragging(false);

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);

      return () => {
         window.removeEventListener('mousemove', handleMove);
         window.removeEventListener('mouseup', handleUp);
      };
   }, [isDragging]);

   const segments: React.ReactNode[] = [];
   for (let i = min; i <= max; i++) {
      segments.push(
         <span
            key={i}
            style={{
               letterSpacing: i === value || i + 1 === value ? '-0.22ch' : '0ch',
               fontFamily: i === value ? 'monospace' : 'CupheadMemphis',
               fontSize: i === value ? '18pt' : '24pt',
            }}
         >
            {i === value ? '|' : '-'}
         </span>
      );
   }

   return (
      <div
         ref={containerRef}
         style={{
            fontFamily: 'monospace',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'inline-block',
         }}
         onMouseDown={handleMouseDown}
      >
         {segments}
      </div>
   );
}
