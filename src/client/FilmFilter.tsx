import { useEffect, useRef } from 'react';
import { useSettings } from './contexts/SettingsContext';
import scratch1 from '@/assets/textures/scratches/scratch1.png';
import scratch2 from '@/assets/textures/scratches/scratch2.png';
import scratch3 from '@/assets/textures/scratches/scratch3.png';
import scratch4 from '@/assets/textures/scratches/scratch4.png';
import scratch5 from '@/assets/textures/scratches/scratch5.png';
import scratch6 from '@/assets/textures/scratches/scratch6.png';

interface Scratch {
   x: number;
   yOffset: number;
   lifetime: number;
   length: number;
   texture?: HTMLImageElement;
}

export default function VintageFilmFilter() {
   const { settings } = useSettings();
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const proceduralScratchesRef = useRef<Scratch[]>([]);
   const textureScratchesRef = useRef<Scratch[]>([]);
   const texturesRef = useRef<HTMLImageElement[]>([]);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      // Load scratch textures
      const texturePaths = [scratch1, scratch2, scratch3, scratch4, scratch5, scratch6];
      texturesRef.current = texturePaths.map((src) => {
         const img = new Image();
         img.src = src;
         return img;
      });

      let frameId: number;

      function render() {
         if (!ctx || !canvas) return;
         ctx.clearRect(0, 0, width, height);

         // --- Vertical bopping ---
         const yOffset = Math.sin(Date.now() / 50) * 1.5;
         ctx.setTransform(1, 0, 0, 1, 0, yOffset);

         // --- Intense film grain ---
         const imageData = ctx.createImageData(width, height);
         const data = imageData.data;
         for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = 15;
         }
         ctx.putImageData(imageData, 0, 0);

         // --- Procedural vertical scratches ---
         if (Math.random() < 0.12) {
            // more frequent
            proceduralScratchesRef.current.push({
               x: Math.random() * width,
               yOffset: 0,
               lifetime: 15 + Math.random() * 10,
               length: height * (0.5 + Math.random() * 0.3),
            });
         }

         proceduralScratchesRef.current.forEach((s, i) => {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 1.2;

            const segments = 25;
            const segHeight = s.length / segments;
            let y = s.yOffset;
            ctx.beginPath();
            ctx.moveTo(s.x + (Math.random() - 0.5) * 2, y);
            for (let j = 0; j < segments; j++) {
               y += segHeight;
               const xJitter = (Math.random() - 0.5) * 4;
               ctx.lineTo(s.x + xJitter, y);
            }
            ctx.stroke();
            ctx.restore();

            s.yOffset += height / 3; // very fast
            s.lifetime--;
            if (s.lifetime <= 0) proceduralScratchesRef.current.splice(i, 1);
         });

         // --- Texture-based scratches ---
         for (let k = 0; k < 3; k++) {
            if (Math.random() < 0.2 && texturesRef.current.length) {
               const tex =
                  texturesRef.current[
                     Math.floor(Math.random() * texturesRef.current.length)
                  ];
               textureScratchesRef.current.push({
                  x: Math.random() * width,
                  yOffset: Math.random() * height,
                  lifetime: 3 + Math.random() * 3, // shorter lifetime
                  length: tex.height,
                  texture: tex,
               });
            }
         }

         textureScratchesRef.current.forEach((s, i) => {
            if (s.texture && s.texture.complete) {
               const segmentHeight = s.length / 4;
               for (let j = 0; j < 4; j++) {
                  const y = (s.yOffset + j * segmentHeight) % height;
                  const xJitter = (Math.random() - 0.5) * 6;
                  ctx.globalAlpha = 0.35;
                  ctx.drawImage(
                     s.texture,
                     0,
                     j * (s.texture.height / 4),
                     s.texture.width,
                     s.texture.height / 4,
                     s.x + xJitter,
                     y,
                     s.texture.width,
                     s.texture.height / 4
                  );
               }
            }
            s.lifetime--;
            if (s.lifetime <= 0) textureScratchesRef.current.splice(i, 1);
         });

         // --- Sepia overlay ---
         if (settings?.filter === 'none') {
            ctx.fillStyle = 'rgba(112, 66, 20, 0.2)'; // increased from 0.08 to 0.2
            ctx.fillRect(0, 0, width, height);
         }

         // --- Vignette ---
         const gradient = ctx.createRadialGradient(
            width / 2,
            height / 2,
            (width / 2) * 0.7,
            width / 2,
            height / 2,
            width / 2
         );
         gradient.addColorStop(0, 'rgba(0,0,0,0)');
         gradient.addColorStop(1, 'rgba(0,0,0,0.35)'); // increased from 0.2 to 0.35
         ctx.fillStyle = gradient;
         ctx.filter = 'blur(24px)';
         ctx.fillRect(0, 0, width, height);
         ctx.filter = 'none';

         frameId = requestAnimationFrame(render);
      }

      render();

      const resize = () => {
         width = canvas.width = window.innerWidth;
         height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);

      return () => {
         cancelAnimationFrame(frameId);
         window.removeEventListener('resize', resize);
      };
   }, [settings?.filter]);

   return (
      <canvas
         ref={canvasRef}
         style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
         }}
      />
   );
}
