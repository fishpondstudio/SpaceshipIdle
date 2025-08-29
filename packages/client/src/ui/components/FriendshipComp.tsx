import { Progress, Switch } from "@mantine/core";
import { FriendshipDurationSeconds } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { type Planet, PlanetFlags } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   formatHMS,
   formatPercent,
   hasFlag,
   SECOND,
   setFlag,
   toggleFlag,
} from "@spaceship-idle/shared/src/utils/Helper";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { FloatingTip } from "./FloatingTip";
import { TextureComp } from "./TextureComp";

export function FriendshipComp({ planet }: { planet: Planet }): React.ReactNode {
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

   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <FloatingTip
               label={
                  <>
                     <div>The cost of declaring friendship is determined as follows</div>
                     <div className="flex-table mx-10 mt5">
                        <div className="row">
                           <div className="f1">Base Cost</div>
                           <div>
                              1 <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                        <div className="row">
                           <div className="f1">Warmonger Penalty</div>
                           <div>
                              2 <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                        <div className="row">
                           <div className="f1">Backstabbing Penalty</div>
                           <div>
                              1 <TextureComp name="Others/Trophy16" className="inline-middle" />
                           </div>
                        </div>
                     </div>
                  </>
               }
            >
               <div>
                  4 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
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
            <div>4h, renewable</div>
         </div>
         <div className="h10" />
         <button
            className="btn green w100 row g5"
            onClick={() => {
               // TODO: Debug Only!
               planet.friendshipTimeLeft = 5;
               planet.flags = setFlag(planet.flags, PlanetFlags.WasFriends);
               GameStateUpdated.emit();
            }}
         >
            <div className="mi sm">handshake</div>
            <div>Declare Friendship</div>
         </button>
      </>
   );
}
