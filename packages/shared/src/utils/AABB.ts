import type { Circle } from "./Circle";
import type { IHaveXY } from "./Vector2";

export class AABB {
   public constructor(
      public min: IHaveXY,
      public max: IHaveXY,
   ) {}

   public static fromRect(rect: { x: number; y: number; width: number; height: number }): AABB {
      return new AABB({ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height });
   }

   public contains(point: IHaveXY): boolean {
      return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y;
   }

   public intersects(other: AABB): boolean {
      return (
         this.min.x < other.max.x && this.max.x > other.min.x && this.min.y < other.max.y && this.max.y > other.min.y
      );
   }

   public get center(): IHaveXY {
      return { x: (this.min.x + this.max.x) / 2, y: (this.min.y + this.max.y) / 2 };
   }

   public get size(): IHaveXY {
      return { x: this.width, y: this.height };
   }
   public get width(): number {
      return this.max.x - this.min.x;
   }
   public get height(): number {
      return this.max.y - this.min.y;
   }

   public extendBy({ x, y }: IHaveXY, result?: AABB): AABB {
      result ??= new AABB(this.min, this.max);
      result.min.x -= x;
      result.min.y -= y;
      result.max.x += x;
      result.max.y += y;
      return result;
   }

   public extend(aabb: AABB): AABB {
      return new AABB(
         { x: Math.min(this.min.x, aabb.min.x), y: Math.min(this.min.y, aabb.min.y) },
         { x: Math.max(this.max.x, aabb.max.x), y: Math.max(this.max.y, aabb.max.y) },
      );
   }

   public static fromCircles(circles: Circle[]): AABB {
      const min = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
      const max = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
      for (const circle of circles) {
         min.x = Math.min(min.x, circle.x - circle.r);
         min.y = Math.min(min.y, circle.y - circle.r);
         max.x = Math.max(max.x, circle.x + circle.r);
         max.y = Math.max(max.y, circle.y + circle.r);
      }
      return new AABB(min, max);
   }
}
