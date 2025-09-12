import { Bonus } from "@spaceship-idle/shared/src/game/definitions/Bonus";
import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getDirectives, hasUnlockedDirective } from "@spaceship-idle/shared/src/game/logic/DirectiveLogic";
import { getElementCenter } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playBling, playUpgrade } from "./Sound";

export function DirectivePage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Directive24" />
               <div className="f1">Directives</div>
            </div>
         }
      >
         {ShipClassList.map((shipClass) => {
            const def = ShipClass[shipClass];
            const selected = G.save.state.selectedDirectives.get(shipClass);

            if (selected) {
               return (
                  <div key={shipClass} className="panel m10">
                     <div className="row">
                        <div className="f1">{t(L.XClassDirective, def.name())}</div>
                     </div>
                     <div className="text-sm mt5">
                        <TextureComp name={"Others/Directive"} className="inline-middle" />{" "}
                        <RenderHTML element="span" html={Bonus[selected].desc(G.runtime)} className="render-html" />
                     </div>
                  </div>
               );
            }

            const unlocked = hasUnlockedDirective(shipClass, G.save.state);
            const directives = unlocked ? getDirectives(shipClass, G.save.state) : [];
            return (
               <FloatingTip
                  disabled={unlocked}
                  key={shipClass}
                  label={t(L.YouCanUnlockThisDirectiveWhenYouResearchAllTechsInClass, def.name())}
               >
                  <div className="panel m10 p0">
                     <div className="row m10">
                        <div className="f1">{t(L.XClassDirective, def.name())}</div>
                        {unlocked ? null : <div className="mi">lock</div>}
                     </div>
                     <div className="text-sm mt5">
                        {directives.map((bonus) => (
                           <React.Fragment key={bonus}>
                              <div className="divider dashed" />
                              <div className="row my5 mx10">
                                 <div>
                                    <TextureComp name={"Others/Directive"} className="inline-middle" />{" "}
                                    <RenderHTML
                                       element="span"
                                       key={bonus}
                                       html={Bonus[bonus].desc(G.runtime)}
                                       className="render-html"
                                    />
                                 </div>
                                 <div className="f1" />
                                 <button
                                    className="btn text-sm"
                                    onClick={(e) => {
                                       playUpgrade();
                                       G.save.state.selectedDirectives.set(shipClass, bonus);
                                       const action = Bonus[bonus].onStart;
                                       if (action) {
                                          playBling();
                                          action(G.runtime, getElementCenter(e.target as HTMLElement));
                                       }
                                       GameStateUpdated.emit();
                                    }}
                                 >
                                    Issue
                                 </button>
                              </div>
                           </React.Fragment>
                        ))}
                     </div>
                  </div>
               </FloatingTip>
            );
         })}
      </SidebarComp>
   );
}
