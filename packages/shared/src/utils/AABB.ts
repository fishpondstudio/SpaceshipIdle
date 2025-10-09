import type { Circle } from "./Circle";
import type { IHaveXY } from "./Vector2";

export interface IAABB {
   min: IHaveXY;
   max: IHaveXY;
   contains(point: IHaveXY): boolean;
   intersects(other: IAABB): boolean;
   get center(): IHaveXY;
   get size(): IHaveXY;
   get width(): number;
   get height(): number;
   extendBy({ x, y }: IHaveXY, result?: IAABB): IAABB;
   extend(aabb: IAABB): IAABB;
}

interface AABBConstructor {
   new (min: IHaveXY, max: IHaveXY): IAABB;
   fromRect(rect: { x: number; y: number; width: number; height: number }): IAABB;
   fromCircles(circles: Circle[]): IAABB;
   fromPoints(points: IHaveXY[]): IAABB;
}

const AABB = function (this: IAABB, min: IHaveXY, max: IHaveXY): void {
   this.min = min;
   this.max = max;
} as unknown as AABBConstructor;

AABB.prototype.contains = function (point: IHaveXY): boolean {
   return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y;
};

AABB.prototype.intersects = function (other: IAABB): boolean {
   return this.min.x < other.max.x && this.max.x > other.min.x && this.min.y < other.max.y && this.max.y > other.min.y;
};

Object.defineProperty(AABB.prototype, "center", {
   get: function (): IHaveXY {
      return { x: (this.min.x + this.max.x) / 2, y: (this.min.y + this.max.y) / 2 };
   },
});

Object.defineProperty(AABB.prototype, "size", {
   get: function (): IHaveXY {
      return { x: this.width, y: this.height };
   },
});

Object.defineProperty(AABB.prototype, "width", {
   get: function (): number {
      return this.max.x - this.min.x;
   },
});

Object.defineProperty(AABB.prototype, "height", {
   get: function (): number {
      return this.max.y - this.min.y;
   },
});

AABB.prototype.extendBy = function ({ x, y }: IHaveXY, result?: IAABB): IAABB {
   const target = result ?? new AABB(this.min, this.max);
   target.min.x -= x;
   target.min.y -= y;
   target.max.x += x;
   target.max.y += y;
   return target;
};

AABB.prototype.extend = function (aabb: IAABB): IAABB {
   return new AABB(
      { x: Math.min(this.min.x, aabb.min.x), y: Math.min(this.min.y, aabb.min.y) },
      { x: Math.max(this.max.x, aabb.max.x), y: Math.max(this.max.y, aabb.max.y) },
   );
};

AABB.fromRect = (rect: { x: number; y: number; width: number; height: number }): IAABB => {
   return new AABB({ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height });
};

AABB.fromCircles = (circles: Circle[]): IAABB => {
   const min = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
   const max = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
   for (const circle of circles) {
      min.x = Math.min(min.x, circle.x - circle.r);
      min.y = Math.min(min.y, circle.y - circle.r);
      max.x = Math.max(max.x, circle.x + circle.r);
      max.y = Math.max(max.y, circle.y + circle.r);
   }
   return new AABB(min, max);
};

AABB.fromPoints = (points: IHaveXY[]): IAABB => {
   const min = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
   const max = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
   for (const point of points) {
      min.x = Math.min(min.x, point.x);
      min.y = Math.min(min.y, point.y);
      max.x = Math.max(max.x, point.x);
      max.y = Math.max(max.y, point.y);
   }
   return new AABB(min, max);
};

export { AABB };
