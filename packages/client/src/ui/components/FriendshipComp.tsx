import { Progress, Switch, Tooltip } from "@mantine/core";
import { FriendshipDurationSeconds } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { type Planet, PlanetActionType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { formatHMS, formatPercent, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { TextureComp } from "./TextureComp";

export function FriendshipComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const current = planet.actions[0];
   if (current?.type === PlanetActionType.DeclaredFriendship) {
      const progress = (Date.now() - current.time) / (FriendshipDurationSeconds * SECOND);
      const timeLeft = FriendshipDurationSeconds * SECOND - (Date.now() - current.time);
      return (
         <>
            <div className="panel">
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
                  <span className="text-dimmed text-sm">({formatPercent(progress)})</span> {formatHMS(timeLeft)}
               </div>
            </div>
            <div className="divider dashed my10 mx-10" />
            <div className="row g5">
               <div className="f1">Auto Renew</div>
               <Switch />
            </div>
         </>
      );
   }

   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />
            <Tooltip
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
            </Tooltip>
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
               planet.actions.unshift({
                  type: PlanetActionType.DeclaredFriendship,
                  time: Date.now(),
               });
               GameStateUpdated.emit();
            }}
         >
            <div className="mi sm">handshake</div>
            <div>Declare Friendship</div>
         </button>
      </>
   );
}
