import { useEffect, useRef } from 'react';

export default function ScrollTriggers() {
   const topRef = useRef<HTMLDivElement | null>(null);
   const bottomRef = useRef<HTMLDivElement | null>(null);

   const MAX_SPEED_PX_PER_SEC = 1200;
   const speedRef = useRef<number>(0);
   const rafRef = useRef<number | null>(null);
   const lastTsRef = useRef<number | null>(null);

   const BLOCK_CLASS = 'no-scroll-zone';

   useEffect(() => {
      function isInsideBlocked(el: EventTarget | null): boolean {
         let node = el as HTMLElement | null;
         while (node) {
            if (node.classList?.contains(BLOCK_CLASS)) return true;
            node = node.parentElement;
         }
         return false;
      }

      function onMouseMove(e: MouseEvent) {
         const topEl = topRef.current;
         const bottomEl = bottomRef.current;
         if (!topEl && !bottomEl) return;

         if (isInsideBlocked(e.target)) {
            speedRef.current = 0;
            stopLoop();
            return;
         }

         const y = e.clientY;
         let newSpeed = 0;

         if (topEl) {
            const rect = topEl.getBoundingClientRect();
            if (y >= rect.top && y <= rect.bottom) {
               const distance = y - rect.top;
               const factor = 1 - Math.max(0, Math.min(1, distance / rect.height));
               newSpeed = -factor * MAX_SPEED_PX_PER_SEC;
            }
         }

         if (bottomEl && newSpeed === 0) {
            const rect = bottomEl.getBoundingClientRect();
            if (y >= rect.top && y <= rect.bottom) {
               const distance = rect.bottom - y;
               const factor = 1 - Math.max(0, Math.min(1, distance / rect.height));
               newSpeed = factor * MAX_SPEED_PX_PER_SEC;
            }
         }

         speedRef.current = newSpeed;
         if (newSpeed !== 0 && rafRef.current === null) startLoop();
         if (newSpeed === 0 && rafRef.current !== null) stopLoop();
      }

      function startLoop() {
         if (rafRef.current !== null) return;
         lastTsRef.current = null;
         rafRef.current = requestAnimationFrame(loop);
      }

      function stopLoop() {
         if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
         }
         lastTsRef.current = null;
      }

      function loop(ts: number) {
         if (lastTsRef.current == null) lastTsRef.current = ts;
         const dt = ts - lastTsRef.current;
         lastTsRef.current = ts;

         const speedPxPerSec = speedRef.current;
         if (speedPxPerSec !== 0) {
            const deltaPx = (speedPxPerSec * dt) / 1000;
            window.scrollBy({ top: deltaPx, behavior: 'auto' });
            rafRef.current = requestAnimationFrame(loop);
         } else {
            stopLoop();
         }
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseleave', stopLoop);

      return () => {
         window.removeEventListener('mousemove', onMouseMove);
         window.removeEventListener('mouseleave', stopLoop);
         stopLoop();
      };
   }, []);

   return (
      <>
         <div ref={topRef} className="scroll-trigger top" aria-hidden />
         <div ref={bottomRef} className="scroll-trigger bottom" aria-hidden />
      </>
   );
}
