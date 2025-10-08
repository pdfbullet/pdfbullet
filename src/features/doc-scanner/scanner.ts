
// src/features/doc-scanner/scanner.ts
import { warpCanvas, type Point } from './geometry';

export async function warpFromQuad(imageDataUrl: string, quad: [Point,Point,Point,Point]) {
  const img = await loadImage(imageDataUrl);
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = img.width;
  srcCanvas.height = img.height;
  const ctx = srcCanvas.getContext('2d')!;
  ctx.drawImage(img,0,0);
  // Output to A4-ish aspect. We'll preserve content by using image's current aspect.
  const outW = img.width;
  const outH = img.height;
  const warped = warpCanvas(srcCanvas, quad, outW, outH);
  return warped.toDataURL('image/jpeg', 0.92);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.crossOrigin = 'anonymous';
    i.src = src;
  });
}
