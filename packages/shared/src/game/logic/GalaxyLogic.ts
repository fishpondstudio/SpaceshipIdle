import { rand } from "../../utils/Helper";
import type { AABB, Circle } from "../../utils/Vector2";

// Poisson-disk sampling for variable-radius circles
export function generateCircles(aabb: AABB, count: number, radius: [number, number]): Circle[] {
   const [minRadius, maxRadius] = radius;
   const circles: Circle[] = [];
   const active: Circle[] = [];

   // Start with a single random circle
   const firstRadius = rand(minRadius, maxRadius);
   const first = { ...randomPoint(aabb, firstRadius), r: firstRadius };
   circles.push(first);
   active.push(first);

   const k = 50; // Attempts per active point

   while (circles.length < count && active.length > 0) {
      // Pick a random active circle
      const idx = Math.floor(rand(0, active.length));
      const center = active[idx];
      let found = false;

      for (let attempt = 0; attempt < k; attempt++) {
         // Random radius for the candidate
         const candidateRadius = rand(minRadius, maxRadius);

         // Generate a random angle and distance (between r and 2r from center)
         const angle = rand(0, Math.PI * 2);
         const minDist = center.r + candidateRadius;
         const maxDist = minDist * 2;
         const dist = rand(minDist, maxDist);

         const x = center.x + Math.cos(angle) * dist;
         const y = center.y + Math.sin(angle) * dist;

         // Check bounds
         if (
            x - candidateRadius < aabb.min.x ||
            x + candidateRadius > aabb.max.x ||
            y - candidateRadius < aabb.min.y ||
            y + candidateRadius > aabb.max.y
         ) {
            continue;
         }

         const candidate: Circle = { x, y, r: candidateRadius };
         if (fits(candidate, circles)) {
            circles.push(candidate);
            active.push(candidate);
            found = true;
            break;
         }
      }

      if (!found) {
         // Remove this active point
         active.splice(idx, 1);
      }
   }
   return circles;
}

function randomPoint(aabb: AABB, r: number): { x: number; y: number } {
   return {
      x: rand(aabb.min.x + r, aabb.max.x - r),
      y: rand(aabb.min.y + r, aabb.max.y - r),
   };
}

function fits(candidate: Circle, circles: Circle[]): boolean {
   for (const c of circles) {
      const dx = candidate.x - c.x;
      const dy = candidate.y - c.y;
      const dist = dx * dx + dy * dy;
      const r = candidate.r + c.r;
      if (dist <= r * r) {
         return false;
      }
   }
   return true;
}
