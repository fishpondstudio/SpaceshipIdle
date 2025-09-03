import { Boosts } from "@spaceship-idle/shared/src/game/definitions/Boosts";
import { Directives } from "@spaceship-idle/shared/src/game/definitions/Directives";
import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { hasUnlockedDirective } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
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
            return (
               <div key={shipClass} className="panel m10">
                  <div className="row">
                     <div className="f1">{t(L.XClassDirective, def.name())}</div>
                     {hasUnlockedDirective(shipClass, G.save.state) ? (
                        <button className="btn filled text-sm">Choose</button>
                     ) : (
                        <FloatingTip label={t(L.YouCanUnlockThisDirectiveWhenYouResearchAllTechsInClass, def.name())}>
                           <div className="mi">lock</div>
                        </FloatingTip>
                     )}
                  </div>

                  <div className="text-sm text-dimmed">
                     {Directives[shipClass].map((boost) => (
                        <div key={boost}>
                           <TextureComp name={"Others/Directive"} className="inline-middle" />{" "}
                           <RenderHTML
                              element="span"
                              key={boost}
                              html={Boosts[boost].desc(G.runtime)}
                              className="render-html"
                           />
                        </div>
                     ))}
                  </div>
               </div>
            );
         })}
      </SidebarComp>
   );
}
