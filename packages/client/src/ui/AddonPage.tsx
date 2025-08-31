import { Addons, getAddonEffect } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { formatNumber, mapOf, reduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React from "react";
import { G } from "../utils/Global";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

export function AddonPage(): React.ReactNode {
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Booster24" />
               <div className="f1">{t(L.Addons)}</div>
            </div>
         }
      >
         <div className="m10">
            <button className="btn filled w100 py5 row">
               <div className="mi">chart_data</div>
               <div>Improve Boosters</div>
            </button>
         </div>
         {mapOf(ShipClass, (k, v) => {
            if (reduceOf(Addons, (prev, _, def) => prev + (def.shipClass === k ? 1 : 0), 0) === 0) {
               return null;
            }
            return (
               <React.Fragment key={k}>
                  <div className="divider my10" />
                  <div className="title">{t(L.XClass, v.name())}</div>
                  <div className="divider my10" />
                  {mapOf(Addons, (booster) => {
                     const def = Addons[booster];
                     const amount = G.save.state.addons.get(booster)?.amount ?? 0;
                     const tile = G.save.state.addons.get(booster)?.tile;
                     const effect = getAddonEffect(amount);
                     if (def.shipClass !== k) {
                        return null;
                     }
                     return (
                        <div key={booster} className="panel m10 row">
                           <TextureComp name={`Booster/${booster}`} width={16 * 2} />
                           <div className="f1">
                              <div>{def.name()}</div>
                              <div className="f1" />
                              {amount > 0 ? (
                                 <>
                                    {tile === null ? (
                                       <div className="text-red row g5">
                                          <div className="mi sm">error</div>
                                          <div className="text-sm">Unequipped</div>
                                       </div>
                                    ) : null}
                                    <div className="row text-sm text-dimmed stretch">
                                       <div>{t(L.Amount)}</div>
                                       <div className="f1" />
                                       <div>{amount}</div>
                                    </div>
                                    <div className="row text-sm text-dimmed stretch g5">
                                       <div>{t(L.Effect)}</div>
                                       <FloatingTip label={<RenderHTML html={def.desc(effect)} />}>
                                          <div className="mi sm">info</div>
                                       </FloatingTip>
                                       <div className="f1" />
                                       <div>+{formatNumber(effect)}</div>
                                    </div>
                                 </>
                              ) : (
                                 <div className="row text-sm text-dimmed">
                                    <div className="f1">{t(L.NotDiscovered)}</div>
                                    <div className="mi">indeterminate_question_box</div>
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </React.Fragment>
            );
         })}
      </SidebarComp>
   );
}
