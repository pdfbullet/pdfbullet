
// src/features/doc-scanner/CropAdjust.tsx
import React, { useRef, useEffect, useState } from 'react';
import type { Point } from './geometry';

type Props = {
  imageDataUrl: string;
  onConfirm: (quad: [Point,Point,Point,Point]) => void;
  onCancel: () => void;
};

const handleSize = 14;

export const CropAdjust: React.FC<Props> = ({ imageDataUrl, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [quad, setQuad] = useState<[Point,Point,Point,Point] | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  useEffect(() => {
    const i = new Image();
    i.onload = () => {
      setImg(i);
      const w = i.width, h = i.height;
      const m = 30;
      setQuad([{x:m,y:m},{x:w-m,y:m},{x:w-m,y:h-m},{x:m,y:h-m}]);
      const c = canvasRef.current!;
      c.width = w; c.height = h;
      draw(i, quad || undefined);
    };
    i.src = imageDataUrl;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDataUrl]);

  useEffect(() => { if (img && quad) draw(img, quad); }, [img, quad]);

  const draw = (image: HTMLImageElement, q?: [Point,Point,Point,Point]) => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.drawImage(image,0,0);
    if (!q) return;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(q[0].x, q[0].y);
    ctx.lineTo(q[1].x, q[1].y);
    ctx.lineTo(q[2].x, q[2].y);
    ctx.lineTo(q[3].x, q[3].y);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    for (let i=0;i<4;i++) {
      ctx.beginPath();
      ctx.rect(q[i].x-handleSize/2, q[i].y-handleSize/2, handleSize, handleSize);
      ctx.fill();
    }
  };

  const pickHandle = (x:number,y:number) => {
    if (!quad) return null;
    for (let i=0;i<4;i++) {
      const p = quad[i];
      if (Math.abs(p.x-x)<handleSize && Math.abs(p.y-y)<handleSize) return i;
    }
    return null;
  };

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrag(pickHandle(x,y));
  };
  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drag===null || !quad) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const q = [...quad] as [Point,Point,Point,Point];
    q[drag] = {x,y};
    setQuad(q);
  };
  const onUp = () => setDrag(null);

  if (!img || !quad) return <div className="p-6 text-center">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="overflow-auto border rounded-lg">
        <canvas
          ref={canvasRef}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          style={{maxWidth:'100%'}}
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
        <button onClick={() => onConfirm(quad)} className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white">Apply Crop</button>
      </div>
    </div>
  );
};
