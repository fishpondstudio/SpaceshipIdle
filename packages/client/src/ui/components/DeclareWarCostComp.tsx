import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { getWarConsequences } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { cls } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import { ResourceRequirementComp } from "./ResourceListComp";

export function DeclareWarCostComp({ planet }: { planet?: Planet }): React.ReactNode {
   const penalties = getWarConsequences(G.save.state, planet);
   const warmonger = getWarmongerPenalty(G.save.state);
   return (
      <>
         <div>The cost of declaring war is as follows:</div>
         <div className="h5" />
         <div className="flex-table mx-10">
            <ResourceRequirementComp
               name={t(L.VictoryPoint)}
               desc={<>- Warmonger Penalty: {warmonger}</>}
               required={-warmonger}
               current={resourceOf("VictoryPoint", G.save.state.resources).current}
               texture="Others/Trophy16"
            />
         </div>
         <div className="divider my10 mx-10 dashed"></div>
         <div>Declaring war will result in the following consequences:</div>
         <div className="h5" />
         <div className="flex-table mx-10">
            {penalties.map((penalty) => {
               return (
                  <div key={penalty.name} className="row">
                     <div className="f1">
                        <div>{penalty.name}</div>
                        {penalty.desc ? <div className="text-xs text-space">{penalty.desc}</div> : null}
                     </div>
                     <div className={cls(penalty.value > 0 ? "text-red" : "text-green")}>+{penalty.value}</div>
                  </div>
               );
            })}
         </div>
      </>
   );
}
