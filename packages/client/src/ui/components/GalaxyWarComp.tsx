import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { FriendshipDurationSeconds } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { type Planet, PlanetActionType, PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { generateShip, getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getBoosterReward } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { cls, formatNumber, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { showModal } from "../../utils/ToggleModal";
import { PreBattleModal } from "../PreBattleModal";
import { FloatingTip } from "./FloatingTip";
import { TextureComp } from "./TextureComp";

export function GalaxyWarComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   const rewards = getBoosterReward(planet.seed, G.save.state);

   if (planet.battleResult) {
      const victoryType = getVictoryType(planet.battleResult.battleScore);
      return (
         <div className="panel">
            <div className="title">Battle Result</div>
            <div className="h5" />
            <div className={cls(victoryType === "Defeated" ? "text-red" : "text-green")}>
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

   let cannotDeclareWarReason = "";
   const current = planet.actions[0];
   if (current?.type === PlanetActionType.DeclaredFriendship) {
      const timeLeft = FriendshipDurationSeconds - (G.save.data.tick - current.tick);
      if (timeLeft > 0) {
         cannotDeclareWarReason = "You cannot declare war because you currently have a friendship with them";
      }
   }

   const warmonger = getWarmongerPenalty(G.save.state);
   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <FloatingTip
               label={
                  <>
                     <div>The cost of declaring war is determined as follows</div>
                     <div className="flex-table mx-10 mt5">
                        <div className="row">
                           <div className="f1">Warmonger Penalty</div>
                           <div>
                              {warmonger} <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                     </div>
                  </>
               }
            >
               <div>
                  {warmonger} <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
               </div>
            </FloatingTip>
            <div className="text-space text-sm">+1 Warmonger Penalty</div>
            <div className="text-space text-sm">+1 Backstabber Penalty</div>
            <div className="divider my10 mx-10" />
            <div className="title">Negotiable Rewards</div>
            <div className="h5" />
            <div>
               <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
            </div>
            {rewards.map((booster) => {
               return (
                  <div key={booster}>
                     <TextureComp name={`Booster/${booster}`} className="inline-middle" /> {Boosters[booster].name()}
                  </div>
               );
            })}
            <div>
               <TextureComp name="Others/XP" className="inline-middle" /> {t(L.XP)}
            </div>
         </div>
         <div className="h5" />
         <div className="text-xs text-dimmed">
            War reparation is negotiated when signing the peace treaty and depends on battle outcome
         </div>
         <div className="h5" />
         <button
            disabled={!!cannotDeclareWarReason}
            className="btn red w100"
            onClick={() => {
               planet.actions.push({ type: PlanetActionType.DeclaredWar, tick: G.save.data.tick });
               const enemy = generateShip("Skiff", Math.random);
               enemy.name = planet.name;
               showModal({
                  children: (
                     <PreBattleModal
                        enemy={enemy}
                        info={{
                           hideEnemyInfo: true,
                           noWarmongerPenalty: planet.type === PlanetType.Pirate,
                           planetId: planet.id,
                        }}
                     />
                  ),
                  size: "lg",
               });
            }}
         >
            <FloatingTip label={cannotDeclareWarReason} disabled={!cannotDeclareWarReason}>
               <div className="row g5">
                  <div className="mi sm">swords</div>
                  <div>Declare War</div>
               </div>
            </FloatingTip>
         </button>
      </>
   );
}
