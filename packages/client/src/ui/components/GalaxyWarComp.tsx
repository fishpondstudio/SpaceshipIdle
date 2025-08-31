import { Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { type Planet, PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { generateShip, getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getAddonReward, getPlanetShipClass, getWarPenalty } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { canSpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { cls, formatNumber, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { srand } from "@spaceship-idle/shared/src/utils/Random";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { showModal } from "../../utils/ToggleModal";
import { PreBattleModal } from "../PreBattleModal";
import { playClick } from "../Sound";
import { DeclareWarCostComp } from "./DeclareWarCostComp";
import { FloatingTip } from "./FloatingTip";
import { TextureComp } from "./TextureComp";

export function GalaxyWarComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   const rewards = getAddonReward(planet.seed, G.save.state);

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
            {mMapOf(planet.battleResult.addons, (addon, count) => {
               return (
                  <div key={addon} className="row">
                     <div className="f1">
                        <TextureComp name={`Addon/${addon}`} className="inline-middle" /> {Addons[addon].name()}
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
   if (planet.friendshipTimeLeft > 0) {
      cannotDeclareWarReason = "You cannot declare war because you currently have a friendship with them";
   }

   const penalties = getWarPenalty(G.save.state, planet);
   const warmonger = getWarmongerPenalty(G.save.state);
   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <FloatingTip label={<DeclareWarCostComp planet={planet} />}>
               <div>
                  <div>
                     {warmonger} <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
                  </div>
                  {penalties.map((penalty) => {
                     if (penalty.value === 0) return null;
                     return (
                        <div key={penalty.name} className="text-red text-sm">
                           +{penalty.value} {penalty.name}
                        </div>
                     );
                  })}
               </div>
            </FloatingTip>
            <div className="divider my10 mx-10" />
            <div className="title">Negotiable Rewards</div>
            <div className="h5" />
            <div>
               <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
            </div>
            {rewards.map((addon) => {
               return (
                  <div key={addon}>
                     <TextureComp name={`Addon/${addon}`} className="inline-middle" /> {Addons[addon].name()}
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
            disabled={!!cannotDeclareWarReason || !canSpendResource("VictoryPoint", warmonger, G.save.state.resources)}
            className="btn red w100"
            onClick={() => {
               playClick();
               const enemy = generateShip(getPlanetShipClass(planet.id, G.save.data.galaxy), srand(planet.seed));
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
            <FloatingTip
               w={350}
               label={
                  <>
                     <div className="text-red">{cannotDeclareWarReason}</div>
                     <DeclareWarCostComp planet={planet} />
                  </>
               }
            >
               <div className="row g5">
                  <div className="mi sm">swords</div>
                  <div>Declare War</div>
               </div>
            </FloatingTip>
         </button>
      </>
   );
}
