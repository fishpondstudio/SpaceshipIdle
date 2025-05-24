const abs = Math.abs;
const min = Math.min;
const ceil = Math.ceil;
const floor = Math.floor;
const rand = Math.random;

const EPSILON = 0.0000001;

function PfromC(c: number): number {
   let ppon = 0;
   let ppbn = 0;
   let sum = 0;

   const fails = ceil(1 / c);

   for (let n = 1; n <= fails; n++) {
      ppon = min(1, n * c) * (1 - ppbn);
      ppbn += ppon;

      sum += n * ppon;
   }

   return 1 / sum;
}

function CfromP(p: number): number {
   let hi = p;
   let lo = 0;
   let mid = 0;
   let p1 = 0;
   let p2 = 1;

   while (true) {
      mid = (hi + lo) * 0.5;
      p1 = PfromC(mid);
      if (abs(p1 - p2) <= EPSILON) break;

      if (p1 > p) {
         hi = mid;
      } else {
         lo = mid;
      }

      p2 = p1;
   }

   return mid;
}

export class PRand {
   chance: number;
   C: number;
   progress: number;

   constructor(chance: number) {
      this.chance = chance;
      this.C = CfromP(chance);
      this.progress = 1;
   }

   next(): boolean {
      const r = rand();
      if (r < this.progress * this.C) {
         this.progress = 1;
         return true;
      }
      this.progress++;
      return false;
   }

   reset(): void {
      this.progress = 1;
   }
}
