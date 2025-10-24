import { Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { mapOf, reduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { AddonModal } from "./AddonModal";
import { AddonComp } from "./components/AddonComp";
import { FloatingTip } from "./components/FloatingTip";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function AddonPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Addon24" />
               <div className="f1">{t(L.Addons)}</div>
            </div>
         }
      >
         {mapOf(ShipClass, (k, v, i) => {
            if (reduceOf(Addons, (prev, _, def) => prev + (def.shipClass === k ? 1 : 0), 0) === 0) {
               return null;
            }
            return (
               <React.Fragment key={k}>
                  {i > 0 ? <div className="divider my10" /> : <div className="h10" />}
                  <div className="title">{t(L.XClass, v.name())}</div>
                  <div className="divider my10" />
                  {mapOf(Addons, (addon) => {
                     const def = Addons[addon];
                     const amount = G.save.state.addons.get(addon)?.amount ?? 0;
                     const tile = G.save.state.addons.get(addon)?.tile;
                     if (def.shipClass !== k) {
                        return null;
                     }
                     return (
                        <FloatingTip
                           key={addon}
                           w={350}
                           label={<AddonComp addon={addon} showDetails showCraft={false} />}
                        >
                           <div
                              className="panel m10 pointer"
                              onClick={() => {
                                 playClick();
                                 showModal({
                                    children: <AddonModal addon={addon} />,
                                    size: "md",
                                    title: (
                                       <>
                                          <TextureComp
                                             name={`Addon/${addon}`}
                                             width={16 * 2}
                                             className="inline-middle"
                                          />{" "}
                                          {Addons[addon].name()}
                                       </>
                                    ),
                                    dismiss: true,
                                 });
                              }}
                           >
                              <div className="row">
                                 <TextureComp name={`Addon/${addon}`} width={16 * 2} />
                                 <div className="f1">
                                    <div className="row">
                                       <div>
                                          {import.meta.env.DEV || amount > 0 ? (
                                             def.name()
                                          ) : (
                                             <div className="mi">indeterminate_question_box</div>
                                          )}
                                       </div>
                                       <div className="f1" />
                                       {amount > 0 && tile === null ? (
                                          <FloatingTip label={t(L.Unequipped)}>
                                             <div className="mi text-red">error</div>
                                          </FloatingTip>
                                       ) : null}
                                    </div>
                                 </div>
                              </div>
                              <div className="divider mx-10 my5 dashed" />
                              {import.meta.env.DEV || amount > 0 ? (
                                 <div className="text-sm">
                                    <AddonComp addon={addon} showDetails={false} showCraft={false} />
                                 </div>
                              ) : (
                                 <div className="row text-sm text-dimmed">
                                    <div className="f1">{t(L.NotDiscovered)}</div>
                                 </div>
                              )}
                           </div>
                        </FloatingTip>
                     );
                  })}
               </React.Fragment>
            );
         })}
      </SidebarComp>
   );
}
