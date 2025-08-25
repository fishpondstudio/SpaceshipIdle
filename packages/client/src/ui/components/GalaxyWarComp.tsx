import { Tooltip } from "@mantine/core";
import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { type Planet, PlanetActionType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { addResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatNumber, formatPercent, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { showModal } from "../../utils/ToggleModal";
import { PeaceTreatyModal } from "../PeaceTreatyModal";
import { TextureComp } from "./TextureComp";

export function GalaxyWarComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   if (planet.battleResult) {
      const victoryType = getVictoryType(planet.battleResult.victory);
      return (
         <div className="panel">
            <div className="title">Battle Result</div>
            <div className="h5" />
            <div className="text-green">
               {BattleVictoryTypeLabel[victoryType]()} ({formatPercent(planet.battleResult.victory)})
            </div>
            <div className="divider my10 mx-10" />
            <div className="title">War Reparation</div>
            <div className="h5" />
            {mMapOf(planet.battleResult.boosters, (booster, count) => {
               return (
                  <div key={booster} className="row">
                     <div className="f1">
                        <TextureComp name={`Booster/${booster}`} className="inline-middle" /> {Boosters[booster].name()}
                     </div>
                     <div>{count}</div>
                  </div>
               );
            })}
            {mMapOf(planet.battleResult.resources, (resource, amount) => {
               const texture = Resources[resource].texture;
               return (
                  <div key={resource} className="row">
                     <div className="f1">
                        {texture ? <TextureComp name={texture} className="inline-middle" /> : null}{" "}
                        {Resources[resource].name()}
                     </div>
                     <div>{formatNumber(amount)}</div>
                  </div>
               );
            })}
         </div>
      );
   }

   const current = planet.actions[0];
   let cannotDeclareWarReason = "";
   if (current?.type === PlanetActionType.DeclaredFriendship) {
      cannotDeclareWarReason = "You cannot declare war because you currently have a friendship with them";
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
                  showModal({ children: <PeaceTreatyModal />, size: "lg", dismiss: true });
                  addResource("Warmonger", 1, G.save.state.resources);
                  planet.actions.push({ type: PlanetActionType.DeclaredWar, tick: G.save.data.tick });
                  planet.battleResult = {
                     victory: 0.68,
                     boosters: new Map([["Evasion1", 1]]),
                     resources: new Map([
                        ["XP", 12900],
                        ["Victory", 2],
                     ]),
                  };
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
