import { Switch } from "@mantine/core";
import { Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { clearFlag, hasFlag, mapOf, reduceOf, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { AddonComp } from "./components/AddonComp";
import { FloatingTip } from "./components/FloatingTip";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { ReforgeAddonModal } from "./ReforgeAddonModal";
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
         <div className="m10">
            <button
               className="btn filled w100 py5 row g5"
               onClick={() => {
                  playClick();
                  showModal({ children: <ReforgeAddonModal />, size: "md", title: t(L.ReforgeAddOns), dismiss: true });
               }}
            >
               <div className="mi">settings_b_roll</div>
               <div>{t(L.ReforgeAddOns)}</div>
            </button>
         </div>
         <div className="divider" />
         <div className="m10 text-sm row">
            <div>Hide Add-on Details</div>
            <div className="f1" />
            <Switch
               size="xs"
               checked={hasFlag(G.save.options.flag, GameOptionFlag.HideAddonDetails)}
               onChange={(e) => {
                  playClick();
                  if (e.target.checked) {
                     G.save.options.flag = setFlag(G.save.options.flag, GameOptionFlag.HideAddonDetails);
                  } else {
                     G.save.options.flag = clearFlag(G.save.options.flag, GameOptionFlag.HideAddonDetails);
                  }
                  GameOptionUpdated.emit();
               }}
            />
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
                  {mapOf(Addons, (addon) => {
                     const def = Addons[addon];
                     const amount = G.save.state.addons.get(addon)?.amount ?? 0;
                     const tile = G.save.state.addons.get(addon)?.tile;
                     if (def.shipClass !== k) {
                        return null;
                     }
                     return (
                        <FloatingTip
                           disabled={!hasFlag(G.save.options.flag, GameOptionFlag.HideAddonDetails)}
                           key={addon}
                           w={350}
                           label={<AddonComp addon={addon} amount={amount} showDetails />}
                        >
                           <div className="panel m10">
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
                                    <AddonComp
                                       addon={addon}
                                       amount={amount}
                                       showDetails={!hasFlag(G.save.options.flag, GameOptionFlag.HideAddonDetails)}
                                    />
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
