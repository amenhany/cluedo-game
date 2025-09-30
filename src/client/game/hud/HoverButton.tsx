import { useState } from 'react';
import { createPortal } from 'react-dom';

type HoverButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
   tooltip: string | null;
};

export default function HoverButton({
   tooltip,
   children,
   ...buttonProps
}: HoverButtonProps) {
   const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

   return (
      <div
         style={{ position: 'relative' }}
         onMouseEnter={() => setPos({ x: 0, y: 0 })}
         onMouseLeave={() => setPos(null)}
         onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      >
         <button {...buttonProps}>{children}</button>

         {tooltip &&
            pos &&
            createPortal(
               <span
                  className="tooltip"
                  style={{
                     top: pos.y + 6,
                     left: pos.x + 10,
                  }}
               >
                  {tooltip}
               </span>,
               document.querySelector('.hud') || document.body
            )}
      </div>
   );
}
