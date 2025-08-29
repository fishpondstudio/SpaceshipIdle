import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { getWarPenalty } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { cls } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { TextureComp } from "./TextureComp";

export function DeclareWarCostComp({ planet }: { planet?: Planet }): React.ReactNode {
   const penalties = getWarPenalty(G.save.state, planet);
   const warmonger = getWarmongerPenalty(G.save.state);
   return (
      <>
         <div>The cost of declaring war is determined as follows</div>
         <div className="h5" />
         <div className="flex-table mx-10">
            <div className="row">
               <div className="f1">Warmonger Penalty</div>
               <div>
                  {warmonger} <TextureComp name="Others/Trophy16" className="inline-middle" />
               </div>
            </div>
         </div>
         <div className="h20" />
         <div>Declaring war will result in the following consequences</div>
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
