import { L, t } from "../../utils/i18n";
import type { IMultiplier } from "./IMultiplier";

export class TrackedValue {
   private readonly _multipliers: IMultiplier[] = [];
   private _multiplierValue;

   constructor(private readonly _initialValue: number) {
      this._multiplierValue = _initialValue;
      this.clear();
   }

   public add(value: number, source: string): void {
      this._multipliers.push({ value, source });
      this._multiplierValue += value;
   }

   public clear(): void {
      this._multipliers.length = 0;
      this._multiplierValue = this._initialValue;
      this._multipliers.push({ value: this._initialValue, source: t(L.BaseValue) });
   }

   public get value(): number {
      return this._multiplierValue;
   }

   public get detail(): IMultiplier[] {
      return this._multipliers;
   }
}
