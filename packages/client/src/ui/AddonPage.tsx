import { Badge } from "@mantine/core";
import { Addons, getAddonEffect } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
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
               <TextureComp name="Others/Addon24" />
               <div className="f1">{t(L.Addons)}</div>
            </div>
         }
      >
         <div className="m10">
            <button className="btn filled w100 py5 row">
               <div className="mi">chart_data</div>
               <div>Improve Add-ons</div>
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
                  {mapOf(Addons, (addons) => {
                     const def = Addons[addons];
                     const amount = G.save.state.addons.get(addons)?.amount ?? 0;
                     const tile = G.save.state.addons.get(addons)?.tile;
                     const effect = getAddonEffect(amount);
                     if (def.shipClass !== k) {
                        return null;
                     }
                     return (
                        <div key={addons} className="panel m10 row">
                           <TextureComp name={`Addon/${addons}`} width={16 * 2} />
                           <div className="f1">
                              <div className="row">
                                 <div>{def.name()}</div>
                                 <div className="f1" />
                                 {amount > 0 && tile === null ? (
                                    <Badge color="red" variant="outline">
                                       <div className="row g5 text-xs">
                                          <div className="mi xs">error</div>
                                          <div className="">{t(L.Unequipped)}</div>
                                       </div>
                                    </Badge>
                                 ) : null}
                              </div>
                              {amount > 0 ? (
                                 <>
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
