import { RingBuffer } from "../../utils/RingBuffer";

export class ValueTracker {
   private _values: RingBuffer<number>;

   constructor(capacity: number) {
      this._values = new RingBuffer<number>(capacity);
   }

   public add(value: number): void {
      this._values.push(value);
   }

   public value(): number | undefined {
      return this._values.get(-1);
   }

   public delta(): number | undefined {
      const current = this.value();
      const previous = this._values.get(-2);
      if (current === undefined || previous === undefined) {
         return undefined;
      }
      return current - previous;
   }
}
