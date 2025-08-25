import { Tooltip } from "@mantine/core";
import { type Planet, PlanetActionType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { addResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { showModal } from "../../utils/ToggleModal";
import { PeaceTreatyModal } from "../PeaceTreatyModal";
import { TextureComp } from "./TextureComp";

export function WarComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   const current = planet.actions[0];
   let cannotDeclareWarReason = "";
   if (current?.type === PlanetActionType.DeclaredFriendship) {
      cannotDeclareWarReason = `You cannot declare war on ${planet.name} because you currently have a friendship with them`;
   }

   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <Tooltip
               label={
                  <>
                     <div>The cost of declaring war is determined as follows</div>
                     <div className="flex-table mx-10 mt5">
                        <div className="row">
                           <div className="f1">Warmonger Penalty</div>
                           <div>
                              2 <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                     </div>
                  </>
               }
            >
               <div>
                  2 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
               </div>
            </Tooltip>
            <div className="divider my10 mx-10" />
            <div className="title">Negotiable Rewards</div>
            <div className="h5" />
            <div>
               <TextureComp name="Booster/Evasion1" className="inline-middle" /> Evasion Cluster
            </div>
            <div>
               <TextureComp name="Booster/HP1" className="inline-middle" /> HP Cluster
            </div>
            <div>
               <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
            </div>
            <div>
               <TextureComp name="Others/XP" className="inline-middle" /> XP
            </div>
         </div>
         <div className="h5" />
         <div className="text-xs text-dimmed">
            War reparation is negotiated when signing the peace treaty and depends on battle outcome
         </div>
         <div className="h5" />
         <Tooltip label={cannotDeclareWarReason} disabled={!cannotDeclareWarReason}>
            <button
               disabled={!!cannotDeclareWarReason}
               className="btn red w100 row g5"
               onClick={() => {
                  showModal({ children: <PeaceTreatyModal />, size: "lg" });
                  addResource("Warmonger", 1, G.save.state.resources);
                  GameStateUpdated.emit();
               }}
            >
               <div className="mi sm">swords</div>
               <div>Declare War</div>
            </button>
         </Tooltip>
      </>
   );
}
