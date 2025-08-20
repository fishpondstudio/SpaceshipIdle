import type { Circle } from "../../utils/Circle";
import { CURRENCY_EPSILON, shuffle } from "../../utils/Helper";

// This function packs circles using the following algorithm:
// - The first circle starts at (0, 0)
// - The second circle is placed tangent to the first circle, at a random angle
// - Iterate over the remaining circles, find the first circle that can be placed tangent to the previous two circles and does not overlap with any packed circles, add to the result with updated x,y. If there are multiple solutions, pick a random one
// - Do this until all circles are packed. If a circle cannot be packed, just ignore it
export function packCircles(circles: Circle[], random: () => number): Circle[] {
   if (circles.length === 0) return [];

   // The result array of packed circles
   const packed: Circle[] = [];

   // Place the first circle at (0, 0)
   const first = { ...circles[0], x: 0, y: 0 };
   packed.push(first);

   if (circles.length === 1) return packed;

   // Place the second circle tangent to the first at a random angle
   const angle = random() * 2 * Math.PI;
   const d = circles[0].r + circles[1].r;
   const second = {
      ...circles[1],
      x: Math.cos(angle) * d,
      y: Math.sin(angle) * d,
   };
   packed.push(second);

   // For each remaining circle, try to place it tangent to two previous circles
   for (let i = 2; i < circles.length; ++i) {
      const candidates: { x: number; y: number }[] = [];

      // Try all pairs of packed circles (j, k) with j < k
      for (let j = 0; j < packed.length; ++j) {
         for (let k = j + 1; k < packed.length; ++k) {
            const c1 = packed[j];
            const c2 = packed[k];
            const r1 = c1.r + circles[i].r;
            const r2 = c2.r + circles[i].r;
            const x1 = c1.x;
            const y1 = c1.y;
            const x2 = c2.x;
            const y2 = c2.y;

            // Compute intersection points of two circles of radius r1 and r2 centered at (x1,y1) and (x2,y2)
            const dx = x2 - x1;
            const dy = y2 - y1;
            const d = Math.sqrt(dx * dx + dy * dy);

            // No solution if circles are too far apart or too close
            if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) continue;

            // Find intersection points
            const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
            const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
            const xm = x1 + (a * dx) / d;
            const ym = y1 + (a * dy) / d;
            const rx = -dy * (h / d);
            const ry = dx * (h / d);

            // Two possible positions
            candidates.push({ x: xm + rx, y: ym + ry });
            if (h > CURRENCY_EPSILON) {
               // If h == 0, only one intersection
               candidates.push({ x: xm - rx, y: ym - ry });
            }
         }
      }

      shuffle(candidates, random);

      // Find the first candidate that does not overlap any packed circle
      for (const pos of candidates) {
         const candidate = { ...circles[i], x: pos.x, y: pos.y };
         if (!overlapsAny(candidate, packed)) {
            packed.push(candidate);
            break;
         }
      }
   }

   return packed;
}

function overlapsAny(circle: Circle, packed: Circle[]): boolean {
   for (const c of packed) {
      const dx = c.x - circle.x;
      const dy = c.y - circle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < c.r + circle.r - 1e-6) return true;
   }
   return false;
}
