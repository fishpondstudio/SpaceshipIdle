import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { hasUnlockedDirective } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
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
                        <div className="mi">lock</div>
                     )}
                  </div>
               </div>
            );
         })}
      </SidebarComp>
   );
}
