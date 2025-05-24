export function randomColor(): number {
   const h = randomInt(0, 360);
   const s = randomInt(50, 100);
   const l = randomInt(70, 100);
   return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): number {
   s /= 100;
   l /= 100;

   const k = (n: number) => (n + h / 30) % 12;
   const a = s * Math.min(l, 1 - l);
   const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

   const r = Math.round(f(0) * 255);
   const g = Math.round(f(8) * 255);
   const b = Math.round(f(4) * 255);

   return (r << 16) + (g << 8) + b;
}

function randomInt(min: number, max: number): number {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
