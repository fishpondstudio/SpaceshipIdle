import { Progress, Switch } from "@mantine/core";
import { FriendshipDurationSeconds } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { type Planet, PlanetFlags } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { canSpendResource, getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
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
import { FloatingTip } from "./FloatingTip";
import { ResourceListComp } from "./ResourceListComp";
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
                  <div className="text-condensed text-sm">
                     All Missiles get +1 Damage Multiplier. All Autocannons get +1 HP Multiplier
                  </div>
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
      cannotDeclareFriendshipReason =
         "You can no longer declare friendship with them because you have declared war on them";
   }

   const warmongerPenalty = getWarmongerPenalty(G.save.state);
   const backstabberPenalty = getStat("Backstabber", G.save.state.stats);
   const totalCost = warmongerPenalty + backstabberPenalty + 1;
   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <FloatingTip
               label={
                  <>
                     <div>{t(L.TheCostOfDeclaringFriendshipIsDeterminedAsFollows)}</div>
                     <div className="flex-table mx-10 mt5">
                        <div className="row">
                           <div className="f1">{t(L.BaseCost)}</div>
                           <div>
                              1 <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                        <div className="row">
                           <div className="f1">{t(L.WarmongerPenalty)}</div>
                           <div>
                              {warmongerPenalty} <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                        <div className="row">
                           <div className="f1">{t(L.BackstabberPenalty)}</div>
                           <div>
                              {backstabberPenalty} <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                     </div>
                  </>
               }
            >
               <div>
                  {totalCost} <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
               </div>
            </FloatingTip>
            <div className="divider my10 mx-10" />
            <div className="title">Rewards</div>
            <div className="h5" />
            <div>
               1 <TextureComp name="Booster/Evasion1" className="inline-middle" /> Evasion Cluster
            </div>
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
               !!cannotDeclareFriendshipReason || !canSpendResource("VictoryPoint", totalCost, G.save.state.resources)
            }
            className="btn green w100"
            onClick={() => {
               // TODO: Debug Only!
               planet.friendshipTimeLeft = 5;
               planet.flags = setFlag(planet.flags, PlanetFlags.WasFriends);
               GameStateUpdated.emit();
            }}
         >
            <FloatingTip
               label={
                  <>
                     <div className="text-red">{cannotDeclareFriendshipReason}</div>
                     <div>
                        Declaring friendship will provide you with the rewards for the duration of the friendship
                     </div>
                     <div className="h5" />
                     <div className="flex-table mx-10">
                        <ResourceListComp res={{ VictoryPoint: -totalCost }} />
                     </div>
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
