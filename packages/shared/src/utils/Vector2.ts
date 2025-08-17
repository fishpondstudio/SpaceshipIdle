import { type Tile, tileToPoint } from "./Helper";

export interface IHaveXY {
   x: number;
   y: number;
}

export class Vector2 {
   /**
    * Create a vector with the given components.
    * @param x - The component of the x-axis.
    * @param y - The component of the y-axis.
    * @returns The vector.
    */
   public static fromTile(tile: Tile): Vector2 {
      const { x, y } = tileToPoint(tile);
      return new Vector2(x, y);
   }

   public static lerp(p1: IHaveXY, p2: IHaveXY, amount: number, result?: IHaveXY): IHaveXY {
      const x = p1.x + (p2.x - p1.x) * amount;
      const y = p1.y + (p2.y - p1.y) * amount;
      if (result) {
         result.x = x;
         result.y = y;
         return result;
      }
      return { x, y };
   }

   public static length(p: IHaveXY): number {
      return Math.sqrt(p.x * p.x + p.y + p.y);
   }

   /**
    * Create a vector with the given components.
    * @param x - The component of the x-axis.
    * @param y - The component of the y-axis.
    * @returns The vector.
    */
   public constructor(
      public x: number,
      public y: number,
   ) {}

   /**
    * Add another vector to the vector.
    * @param val - The vector to be added.
    * @returns The resulting vector of the addition.
    */
   public add(val: IHaveXY, result?: Vector2): Vector2 {
      if (result) {
         result.x += val.x;
         result.y += val.y;
         return result;
      }
      return new Vector2(this.x + val.x, this.y + val.y);
   }
   public addSelf(val: IHaveXY): Vector2 {
      this.x = this.x + val.x;
      this.y = this.y + val.y;
      return this;
   }

   /**
    * Subtract another vector from the vector.
    * @param val - The vector to be added.
    * @returns The resulting vector of the subtraction.
    */
   public subtract(val: IHaveXY): Vector2 {
      return new Vector2(this.x - val.x, this.y - val.y);
   }
   public subtractSelf(val: IHaveXY): Vector2 {
      this.x = this.x - val.x;
      this.y = this.y - val.y;
      return this;
   }

   /**
    * Multiply the vector by a scalar.
    * @param scalar - The scalar the vector will be multiplied by.
    * @returns The resulting vector of the multiplication.
    */
   public multiply(scalar: number): Vector2 {
      return new Vector2(this.x * scalar, this.y * scalar);
   }
   public multiplySelf(scalar: number): Vector2 {
      this.x = this.x * scalar;
      this.y = this.y * scalar;
      return this;
   }

   /**
    * Divide the vector by a scalar.
    * @param scalar - The scalar the vector will be divided by.
    * @returns The resulting vector of the division.
    */
   public divide(scalar: number): Vector2 {
      return new Vector2(this.x / scalar, this.y / scalar);
   }
   public divideSelf(scalar: number): Vector2 {
      this.x = this.x / scalar;
      this.y = this.y / scalar;
      return this;
   }

   /**
    * Calculate the dot product of the vector and another vector.
    * @param other - The other vector used for calculating the dot product.
    * @returns The dot product.
    */
   public dot(other: IHaveXY): number {
      return this.x * other.x + this.y * other.y;
   }

   /**
    * Calculate the cross product of the vector and another vector. The cross product of two vectors `a` and `b` is defined as `a.x * b.y - a.y * b.x`.
    * @param other - The other vector used for calculating the cross product.
    * @returns The cross product.
    */
   public cross(other: IHaveXY): number {
      return this.x * other.y - other.x * this.y;
   }

   /**
    * Calculate the Hadamard product of the vector and another vector.
    * @param other - The other vector used for calculating the Hadamard product.
    * @returns The Hadamard product.
    */
   public hadamard(other: IHaveXY): Vector2 {
      return new Vector2(this.x * other.x, this.y * other.y);
   }

   public hadamardSelf(other: IHaveXY): Vector2 {
      this.x = this.x * other.x;
      this.y = this.y * other.y;
      return this;
   }

   /**
    * Calculate the length of the vector using the L2 norm.
    * @returns The length.
    */
   public length(): number {
      return Math.sqrt(this.lengthSqr());
   }

   public lengthSqr(): number {
      return this.x ** 2 + this.y ** 2;
   }

   /**
    * Normalize the vector using the L2 norm.
    * @returns The normalized vector.
    */
   public normalize(): Vector2 {
      const length = this.length();
      return new Vector2(this.x / length, this.y / length);
   }

   public normalizeSelf(): Vector2 {
      const length = this.length();
      this.x = this.x / length;
      this.y = this.y / length;
      return this;
   }

   /**
    * Rotate the vector by the given radians counterclockwise.
    * @param radians - The radians the vector will be rotated by.
    * @returns The rotated vector.
    */
   public rotateByRadians(radians: number): Vector2 {
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
   }

   /**
    * Rotate the vector by the given degrees counterclockwise.
    * @param degrees - The degrees the vector will be rotated by.
    * @returns The rotated vector.
    */
   public rotateByDegrees(degrees: number): Vector2 {
      return this.rotateByRadians((degrees * Math.PI) / 180);
   }

   public toXY(): IHaveXY {
      return { x: this.x, y: this.y };
   }
}

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

   public extend(aabb: AABB): AABB {
      return new AABB(
         { x: Math.min(this.min.x, aabb.min.x), y: Math.min(this.min.y, aabb.min.y) },
         { x: Math.max(this.max.x, aabb.max.x), y: Math.max(this.max.y, aabb.max.y) },
      );
   }
}

export function v2({ x, y }: IHaveXY): Vector2 {
   return new Vector2(x, y);
}

export interface Circle {
   x: number;
   y: number;
   r: number;
}
