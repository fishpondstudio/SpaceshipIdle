import { Tooltip } from "@mantine/core";
import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { type Planet, PlanetActionType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { addResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatNumber, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { showModal } from "../../utils/ToggleModal";
import { PeaceTreatyModal } from "../PeaceTreatyModal";
import { TextureComp } from "./TextureComp";

export function GalaxyWarComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   if (planet.battleResult) {
      const victoryType = getVictoryType(planet.battleResult.battleScore);
      return (
         <div className="panel">
            <div className="title">Battle Result</div>
            <div className="h5" />
            <div className="text-green">
               {BattleVictoryTypeLabel[victoryType]()} ({planet.battleResult.battleScore}%)
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
            <Tooltip.Floating
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
            </Tooltip.Floating>
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
         <Tooltip.Floating label={cannotDeclareWarReason} disabled={!cannotDeclareWarReason}>
            <button
               disabled={!!cannotDeclareWarReason}
               className="btn red w100 row g5"
               onClick={() => {
                  showModal({
                     children: (
                        <PeaceTreatyModal
                           name={planet.name}
                           texture={`Galaxy/${planet.texture}`}
                           battleScore={62}
                           enemyXP={12431}
                           planetId={planet.id}
                        />
                     ),
                     size: "lg",
                     dismiss: true,
                  });
                  addResource("Warmonger", 1, G.save.state.resources);
                  planet.actions.push({ type: PlanetActionType.DeclaredWar, tick: G.save.data.tick });
                  planet.battleResult = {
                     battleScore: 72,
                     boosters: new Map([["Evasion1", 1]]),
                     resources: new Map([
                        ["XP", 12900],
                        ["VictoryPoint", 2],
                     ]),
                  };

                  // showLoading();
                  // const enemy = generateShip("Skiff", Math.random);
                  // const me = structuredClone(G.save.state);
                  // me.resources.clear();
                  // enemy.resources.clear();
                  // G.speed = 0;
                  // G.runtime = new Runtime({ state: me, options: G.save.options, data: G.save.data }, enemy);
                  // G.runtime.battleType = BattleType.Qualifier;
                  // G.scene.loadScene(ShipScene);
                  // hideSidebar();
                  // hideModal();
                  // GameStateUpdated.emit();
                  // setTimeout(() => {
                  //    G.speed = 1;
                  //    hideLoading();
                  //    GameStateUpdated.emit();
                  // }, 1000);

                  GameStateUpdated.emit();
               }}
            >
               <div className="mi sm">swords</div>
               <div>Declare War</div>
            </button>
         </Tooltip.Floating>
      </>
   );
}
