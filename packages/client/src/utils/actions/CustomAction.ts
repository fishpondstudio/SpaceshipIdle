import { Action } from "./Action";
import type { EasingFunction } from "./Easing";
import { Easing } from "./Easing";

const PointInterpolator = <T extends { x: number; y: number }>(initial: T, target: T, factor: number): T => {
   return {
      x: initial.x + (target.x - initial.x) * factor,
      y: initial.y + (target.y - initial.y) * factor,
   } as T;
};

const NumberInterpolator = <T extends number>(initial: T, target: T, factor: number) => {
   return initial + (target - initial) * factor;
};

export class CustomAction<T> extends Action {
   private readonly interpolation: EasingFunction;

   private initialValue: T | undefined;
   private readonly targetValue: T;
   private time = 0;
   private readonly seconds: number;
   private readonly setter: (value: T) => void;
   private readonly getInitialValue: () => T;
   private readonly interpolator: (initial: T, target: T, factor: number) => T;

   constructor(
      getInitialValue: () => T,
      setter: (value: T) => void,
      interpolator: (initial: T, target: T, factor: number) => T,
      targetValue: T,
      seconds: number,
      interpolation: EasingFunction = Easing.Linear,
   ) {
      super();
      this.interpolation = interpolation;
      this.getInitialValue = getInitialValue;
      this.setter = setter;
      this.interpolator = interpolator;
      this.targetValue = targetValue;
      this.seconds = seconds;
   }

   public static createPoint<T extends { x: number; y: number }>(
      getInitialValue: () => T,
      setter: (value: T) => void,
      targetValue: T,
      seconds: number,
      interpolation: EasingFunction = Easing.Linear,
   ): CustomAction<T> {
      return new CustomAction(getInitialValue, setter, PointInterpolator, targetValue, seconds, interpolation);
   }

   tick(delta: number): boolean {
      this.time += delta;
      const factor: number = this.interpolation(this.timeDistance);
      if (!this.initialValue) {
         this.initialValue = this.getInitialValue();
      }
      this.setter(this.interpolator(this.initialValue, this.targetValue, factor));
      return this.timeDistance >= 1;
   }

   get timeDistance(): number {
      return Math.min(1, this.time / this.seconds);
   }

   override reset() {
      super.reset();
      this.time = 0;
      return this;
   }
}
