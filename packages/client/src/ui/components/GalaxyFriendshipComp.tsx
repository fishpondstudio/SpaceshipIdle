import { Progress, Switch } from "@mantine/core";
import { Boosts } from "@spaceship-idle/shared/src/game/definitions/Boosts";
import { FriendshipBaseCost, FriendshipDurationSeconds } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { type Planet, PlanetFlags } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getAvailableFriendship } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import {
   canSpendResource,
   getStat,
   resourceOf,
   trySpendResource,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import {
   formatHM,
   formatHMS,
   formatPercent,
   hasFlag,
   SECOND,
   setFlag,
   toggleFlag,
} from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { playError } from "../Sound";
import { FloatingTip } from "./FloatingTip";
import { RenderHTML } from "./RenderHTMLComp";
import { ResourceRequirementComp } from "./ResourceListComp";
import { TextureComp } from "./TextureComp";

export function GalaxyFriendshipComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (planet.friendshipTimeLeft > 0) {
      const progress = 1 - planet.friendshipTimeLeft / FriendshipDurationSeconds;
      const timeLeft = planet.friendshipTimeLeft;
      if (timeLeft > 0) {
         return (
            <>
               <div className="panel green">
                  <div className="title">Rewards</div>
                  <div className="h5" />
                  <div className="text-sm">{Boosts[planet.friendshipBoost].desc(G.runtime)}</div>
               </div>
               <div className="h10" />
               <Progress size="lg" value={progress * 100} />
               <div className="h5" />
               <div className="row">
                  <div className="f1">Time Left</div>
                  <div>
                     <span className="text-dimmed text-sm">({formatPercent(progress)})</span>{" "}
                     {formatHMS(timeLeft * SECOND)}
                  </div>
               </div>
               <div className="divider dashed my10 mx-10" />
               <div className="row g5">
                  <div>Auto Renew</div>
                  <FloatingTip label="Automatically renews the friendship when it expires. The cost is determined at the time of renewal. Renewal will fail if there isn't enough resources">
                     <div className="mi sm">info</div>
                  </FloatingTip>
                  <div className="f1" />
                  <Switch
                     checked={hasFlag(planet.flags, PlanetFlags.AutoRenewFriendship)}
                     onChange={() => {
                        planet.flags = toggleFlag(planet.flags, PlanetFlags.AutoRenewFriendship);
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
            </>
         );
      }
   }

   let cannotDeclareFriendshipReason = "";

   if (planet.battleResult) {
      cannotDeclareFriendshipReason = t(L.FriendshipInvalidDueToWar);
   }

   const warmongerPenalty = getWarmongerPenalty(G.save.state);
   const backstabberPenalty = getStat("Backstabber", G.save.state.stats);
   const totalCost = warmongerPenalty + backstabberPenalty + FriendshipBaseCost;
   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <FloatingTip label={<FriendshipCostComp />}>
               <div>
                  {totalCost} <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
               </div>
            </FloatingTip>
            <div className="divider my10 mx-10" />
            <div className="title">Rewards</div>
            <div className="h5" />
            <RenderHTML html={Boosts[planet.friendshipBoost].desc(G.runtime)} className="render-html" />
            <div className="divider my10 mx-10" />
            <div className="title">Duration</div>
            <div className="h5" />
            <div>
               {formatHM(FriendshipDurationSeconds * SECOND)} ({t(L.Renewable)})
            </div>
         </div>
         <div className="h10" />
         <button
            disabled={
               !!cannotDeclareFriendshipReason ||
               !canSpendResource("VictoryPoint", totalCost, G.save.state.resources) ||
               getAvailableFriendship(G.save) <= 0
            }
            className="btn green w100"
            onClick={() => {
               if (getAvailableFriendship(G.save) <= 0) {
                  playError();
                  return;
               }

               if (!trySpendResource("VictoryPoint", totalCost, G.save.state.resources)) {
                  playError();
                  return;
               }

               // TODO: Debug Only!
               planet.friendshipTimeLeft = 5;
               Boosts[planet.friendshipBoost].onStart?.(G.runtime);
               planet.flags = setFlag(planet.flags, PlanetFlags.WasFriends);
               GameStateUpdated.emit();
            }}
         >
            <FloatingTip
               label={
                  <>
                     <div className="text-red">{cannotDeclareFriendshipReason}</div>
                     <FriendshipCostComp />
                  </>
               }
            >
               <div className="row g5">
                  <div className="mi sm">handshake</div>
                  <div>Declare Friendship</div>
               </div>
            </FloatingTip>
         </button>
      </>
   );
}

function FriendshipCostComp(): React.ReactNode {
   const warmongerPenalty = getWarmongerPenalty(G.save.state);
   const backstabberPenalty = getStat("Backstabber", G.save.state.stats);
   const totalCost = warmongerPenalty + backstabberPenalty + 1;
   const victoryPoint = resourceOf("VictoryPoint", G.save.state.resources).current;
   return (
      <>
         <div>To declare friendship, the following resources are required:</div>
         <div className="h5"></div>
         <div className="flex-table mx-10">
            <ResourceRequirementComp
               name={t(L.VictoryPoint)}
               desc={
                  <>
                     <div>- Base Cost: {FriendshipBaseCost}</div>
                     <div>- Warmonger Penalty: {warmongerPenalty}</div>
                     <div>- Backstabber Penalty: {backstabberPenalty}</div>
                  </>
               }
               required={-totalCost}
               current={victoryPoint}
               texture="Others/Trophy16"
            />
            <ResourceRequirementComp
               name={t(L.FriendshipSlot)}
               required={-1}
               current={getAvailableFriendship(G.save)}
            />
         </div>
      </>
   );
}
