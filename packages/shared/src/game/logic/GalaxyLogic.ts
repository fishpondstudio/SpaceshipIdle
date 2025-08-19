import type { AABB, Circle } from "../../utils/Vector2";

export function packCircles(circles: Circle[], aabb: AABB): Circle[] {
   circles.sort((a, b) => b.r - a.r);
   const packed: Circle[] = [];
   for (const circle of circles) {
      let placed = false;
      const step = Math.max(Math.min(aabb.width, aabb.height) / 100, 1);
      for (let x = aabb.min.x + circle.r; x <= aabb.max.x - circle.r && !placed; x += step) {
         for (let y = aabb.min.y + circle.r; y <= aabb.max.y - circle.r && !placed; y += step) {
            const candidate: Circle = { x, y, r: circle.r };
            if (fits(candidate, packed)) {
               packed.push(candidate);
               placed = true;
            }
         }
      }
      // If not placed, just skip this circle (could not fit)
   }
   return packed;
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
