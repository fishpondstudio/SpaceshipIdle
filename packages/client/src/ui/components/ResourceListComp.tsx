import { canSpendResource, getAvailableQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { cls, formatNumber, mathSign } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../../utils/Global";
import { TextureComp } from "./TextureComp";

export function ResourceListComp({ xp, quantum }: { xp: number; quantum: number }): React.ReactNode {
   let enoughXp = true;
   if (xp < 0) {
      enoughXp = canSpendResource("XP", Math.abs(xp), G.save.state.resources);
   }
   let enoughQuantum = true;
   if (quantum < 0) {
      enoughQuantum = getAvailableQuantum(G.save.state) >= Math.abs(quantum);
   }
   return (
      <>
         {xp === 0 ? null : (
            <div className="row">
               <TextureComp name="Others/XP24" />
               <div className="f1">{t(L.XP)}</div>
               <div className={cls(enoughXp ? "text-green" : "text-red")}>
                  {mathSign(xp)}
                  {formatNumber(Math.abs(xp))}
               </div>
               {enoughXp ? (
                  <div className="mi sm text-green">check_circle</div>
               ) : (
                  <div className="mi sm text-red">cancel</div>
               )}
            </div>
         )}
         {quantum === 0 ? null : (
            <div className="row">
               <TextureComp name="Others/Quantum24" />
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
      </>
   );
}
