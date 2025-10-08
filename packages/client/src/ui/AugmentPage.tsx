import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

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
         <div className="panel m10">
            <div>-1 Minimum Warmonger Penalty</div>
            <div className="divider dashed mx-10 my10" />
            <div className="row">
               <div>Level 3</div>
               <div className="f1" />
               <button className="btn text-sm">Upgrade</button>
               <button className="btn text-sm red">Reset</button>
            </div>
         </div>
      </SidebarComp>
   );
}
