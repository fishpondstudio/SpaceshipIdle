import { Augments, getAugments } from "@spaceship-idle/shared/src/game/definitions/Augments";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   canSpendResource,
   refundResource,
   resourceOf,
   trySpendResource,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { ResourceListComp } from "./components/ResourceListComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError } from "./Sound";

export function AugmentPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Propeller" />
               <div className="f1">{t(L.Augment)}</div>
            </div>
         }
      >
         <div className="panel m10 row">
            <TextureComp name="Others/Quantum24" />
            <div>{t(L.Quantum)}</div>
            <div className="f1" />
            <div>{resourceOf("Quantum", G.save.state.resources).current}</div>
         </div>
         {getAugments(G.save.state).map((augment, index) => {
            const starSystem = G.save.data.galaxy.starSystems[index];
            if (!starSystem) {
               return null;
            }
            const level = G.save.state.augments.get(augment) ?? 0;
            const upgradeCost = level + 1;
            let totalCost = 0;
            for (let i = 1; i <= level; i++) {
               totalCost += i;
            }
            return (
               <div className="panel m10" key={augment}>
                  {starSystem.discovered ? (
                     <>
                        <div>{Augments[augment].desc(1, G.runtime)}</div>
                        <div className="divider dashed mx-10 my10" />
                        <div className="row">
                           <FloatingTip label={Augments[augment].desc(level, G.runtime)}>
                              <div className="f1">{t(L.LevelX, level)}</div>
                           </FloatingTip>
                           <button
                              disabled={!canSpendResource("Quantum", upgradeCost, G.save.state.resources)}
                              className="btn text-sm"
                              onClick={() => {
                                 if (!trySpendResource("Quantum", upgradeCost, G.save.state.resources)) {
                                    playError();
                                    return;
                                 }
                                 playClick();
                                 G.save.state.augments.set(augment, level + 1);
                                 GameStateUpdated.emit();
                              }}
                           >
                              <FloatingTip
                                 w={300}
                                 label={
                                    <>
                                       {t(L.LevelXWillHaveTheFollowingEffect, level + 1)}
                                       <div className="text-space">{Augments[augment].desc(level + 1, G.runtime)}</div>
                                       <div className="h10" />
                                       {t(L.AndConsumeTheFollowingResources)}
                                       <div className="h5" />
                                       <div className="flex-table mx-10">
                                          <ResourceListComp res={{ Quantum: -upgradeCost }} />
                                       </div>
                                    </>
                                 }
                              >
                                 <div>{t(L.Upgrade)}</div>
                              </FloatingTip>
                           </button>
                           <button
                              disabled={
                                 totalCost === 0 || !canSpendResource("VictoryPoint", level, G.save.state.resources)
                              }
                              className="btn text-sm red"
                              onClick={() => {
                                 if (!trySpendResource("VictoryPoint", level, G.save.state.resources)) {
                                    playError();
                                    return;
                                 }
                                 playClick();
                                 refundResource("Quantum", totalCost, G.save.state.resources);
                                 G.save.state.augments.delete(augment);
                                 GameStateUpdated.emit();
                              }}
                           >
                              <FloatingTip
                                 label={
                                    <>
                                       {html(t(L.ResettingToLevel0AndRefundAllTheQuantum, totalCost))}
                                       <div className="h10" />
                                       {t(L.AndConsumeTheFollowingResources)}
                                       <div className="h5" />
                                       <div className="flex-table mx-10">
                                          <ResourceListComp res={{ VictoryPoint: -level }} />
                                       </div>
                                    </>
                                 }
                                 w={300}
                              >
                                 <div>{t(L.Reset)}</div>
                              </FloatingTip>
                           </button>
                        </div>
                     </>
                  ) : (
                     <FloatingTip label={html(t(L.UnlockAugmentTooltipHTML, starSystem.name))}>
                        <div className="row text-dimmed">
                           <div>{t(L.UnlockWhenDiscoverX, starSystem.name)}</div>
                           <div className="f1" />
                           <div className="mi">lock</div>
                        </div>
                     </FloatingTip>
                  )}
               </div>
            );
         })}
      </SidebarComp>
   );
}
