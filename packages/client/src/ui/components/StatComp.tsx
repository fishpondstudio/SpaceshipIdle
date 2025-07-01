import { formatNumber, mathSign } from "@spaceship-idle/shared/src/utils/Helper";

export function StatComp({ current, original, flip = false }: { current: number; original: number; flip?: boolean }) {
   const diff = current - original;
   let color: string;
   if (flip) {
      color = diff > 0 ? "text-red" : "text-green";
   } else {
      color = diff > 0 ? "text-green" : "text-red";
   }
   return (
      <>
         {formatNumber(original)}
         {diff === 0 ? null : (
            <span className={color}>
               {mathSign(diff, flip ? "-" : "+")}
               {formatNumber(Math.abs(diff))}
            </span>
         )}
      </>
   );
}
