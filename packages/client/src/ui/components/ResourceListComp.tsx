import { type Resource, Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { canSpendResource, getAvailableQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { cls, formatNumber, mapOf, mathSign } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../../utils/Global";
import { TextureComp } from "./TextureComp";

export function ResourceListComp({
   res,
   quantum = 0,
}: {
   res: Partial<Record<Resource, number>>;
   quantum?: number;
}): React.ReactNode {
   let enoughQuantum = true;
   if (quantum < 0) {
      enoughQuantum = getAvailableQuantum(G.save.state) >= Math.abs(quantum);
   }
   return (
      <>
         {quantum === 0 ? null : (
            <div className="row g5">
               <TextureComp name="Others/Quantum" />
               <div className="f1">{t(L.Quantum)}</div>
               <div className={cls(enoughQuantum ? "text-green" : "text-red")}>
                  {mathSign(quantum)}
                  {formatNumber(Math.abs(quantum))}
               </div>
               {enoughQuantum ? (
                  <div className="mi sm text-green">check_circle</div>
               ) : (
                  <div className="mi sm text-red">cancel</div>
               )}
            </div>
         )}
         {mapOf(res, (res, amount) => {
            const def = Resources[res];
            const hasEnough = amount >= 0 ? true : canSpendResource(res, -amount, G.save.state.resources);
            return (
               <div className="row g5">
                  <TextureComp name={def.texture} />
                  <div className="f1">{def.name()}</div>
                  <div className={cls(hasEnough ? "text-green" : "text-red")}>
                     {mathSign(amount)}
                     {formatNumber(Math.abs(amount))}
                  </div>
                  {hasEnough ? (
                     <div className="mi sm text-green">check_circle</div>
                  ) : (
                     <div className="mi sm text-red">cancel</div>
                  )}
               </div>
            );
         })}
      </>
   );
}
