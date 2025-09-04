import { Boosts } from "@spaceship-idle/shared/src/game/definitions/Boosts";
import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { getDirectives } from "@spaceship-idle/shared/src/game/logic/DirectiveLogic";
import { hasUnlockedDirective } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React from "react";
import { G } from "../utils/Global";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

export function DirectivePage(): React.ReactNode {
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
            const unlocked = hasUnlockedDirective(shipClass, G.save.state);
            const directives = getDirectives(shipClass, G.save.state);
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
                     <div className="text-sm text-dimmed mt5">
                        {directives.map((boost) => (
                           <React.Fragment key={boost}>
                              <div className="divider dashed" />
                              <div className="row my5 mx10">
                                 <div>
                                    <TextureComp name={"Others/Directive"} className="inline-middle" />{" "}
                                    <RenderHTML
                                       element="span"
                                       key={boost}
                                       html={Boosts[boost].desc(G.runtime)}
                                       className="render-html"
                                    />
                                 </div>
                                 <div className="f1" />
                                 <button className="btn text-sm">Issue</button>
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
