
// src/features/doc-scanner/geometry.ts
// Lightweight perspective transform (homography) utilities.
// Nearest-neighbor resampling for speed (good enough for documents).

export type Point = { x: number; y: number };

// Compute homography matrix from 4 src and 4 dst points.
// Returns a 3x3 matrix as a flat array of 9 numbers.
export function getHomography(src: Point[], dst: Point[]): number[] {
  // Solve using Direct Linear Transform (DLT)
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const xs = src[i].x, ys = src[i].y, xd = dst[i].x, yd = dst[i].y;
    A.push([-xs, -ys, -1, 0, 0, 0, xs*xd, ys*xd, xd]);
    A.push([0, 0, 0, -xs, -ys, -1, xs*yd, ys*yd, yd]);
  }
  // Solve Ah = 0 via SVD. We'll implement a tiny SVD using numeric.js style
  // For brevity and bundle size, we use a minimal power-iteration on A^T A.
  const AT = transpose(A);
  const ATA = multiply(AT, A);
  const eigVec = smallestEigenVector(ATA); // 9x1
  const H = eigVec; // last eigenvector corresponds to smallest eigenvalue
  // Normalize so H[8] = 1
  for (let i=0;i<9;i++) H[i] /= H[8];
  return H;
}

export function applyHomography(H: number[], x: number, y: number) {
  const X = H[0]*x + H[1]*y + H[2];
  const Y = H[3]*x + H[4]*y + H[5];
  const W = H[6]*x + H[7]*y + H[8];
  return { x: X/W, y: Y/W };
}

// Warp an input canvas to a target width/height using src->dst mapping.
// dstQuad is assumed to be [ (0,0), (W,0), (W,H), (0,H) ] so we only need srcQuad.
export function warpCanvas(
  srcCanvas: HTMLCanvasElement,
  srcQuad: Point[],
  outW: number,
  outH: number
): HTMLCanvasElement {
  const dstQuad: Point[] = [{x:0,y:0},{x:outW,y:0},{x:outW,y:outH},{x:0,y:outH}];
  const H = getHomography(dstQuad, srcQuad); // map output -> input
  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const outCtx = out.getContext('2d')!;
  const srcCtx = srcCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0,0,srcCanvas.width, srcCanvas.height);
  const outData = outCtx.createImageData(outW, outH);
  const o = outData.data;
  const s = srcData.data;

  for (let j=0;j<outH;j++) {
    for (let i=0;i<outW;i++) {
      const p = applyHomography(H, i, j);
      const xi = Math.round(p.x), yi = Math.round(p.y);
      if (xi>=0 && xi<srcCanvas.width && yi>=0 && yi<srcCanvas.height) {
        const si = (yi*srcCanvas.width + xi)*4;
        const oi = (j*outW + i)*4;
        o[oi] = s[si];
        o[oi+1] = s[si+1];
        o[oi+2] = s[si+2];
        o[oi+3] = 255;
      }
    }
  }
  outCtx.putImageData(outData,0,0);
  return out;
}

// ---------- tiny linear algebra helpers ----------
function transpose(M: number[][]): number[][] {
  const r = M.length, c = M[0].length;
  const T = Array.from({length: c}, () => Array(r).fill(0));
  for (let i=0;i<r;i++) for (let j=0;j<c;j++) T[j][i] = M[i][j];
  return T;
}
function multiply(A: number[][], B: number[][]): number[][] {
  const r = A.length, n = B.length, c = B[0].length;
  const R = Array.from({length: r}, () => Array(c).fill(0));
  for (let i=0;i<r;i++) {
    for (let k=0;k<n;k++) {
      const aik = A[i][k];
      for (let j=0;j<c;j++) R[i][j] += aik * B[k][j];
    }
  }
  return R;
}
// Power iteration to approximate smallest eigenvector of symmetric ATA
function smallestEigenVector(M: number[][]): number[] {
  // Compute largest eigenvector of inverse(M) ≈ use power iteration on shifted matrix.
  // For stability, we estimate largest eigenvector of (alpha I - M) with large alpha.
  const n = M.length;
  const alpha = trace(M) + 1;
  const A = Array.from({length:n}, (_,i)=>Array.from({length:n},(_,j)=> (i===j?alpha:0) - M[i][j]));
  let v = Array.from({length:n}, ()=>Math.random());
  normalize(v);
  for (let it=0; it<80; it++) {
    const Av = matVec(A, v);
    v = Av;
    normalize(v);
  }
  return v;
}
function matVec(A: number[][], v: number[]): number[] {
  const r = A.length, c = A[0].length;
  const out = Array(r).fill(0);
  for (let i=0;i<r;i++) for (let j=0;j<c;j++) out[i]+=A[i][j]*v[j];
  return out;
}
function trace(M: number[][]): number {
  let t=0; for (let i=0;i<M.length;i++) t+=M[i][i]; return t;
}
function normalize(v: number[]) { 
  let s=0; for (const x of v) s+=x*x; s=Math.sqrt(s)||1; 
  for (let i=0;i<v.length;i++) v[i]/=s; 
}
