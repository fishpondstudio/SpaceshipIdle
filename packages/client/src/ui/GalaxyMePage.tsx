import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getCurrentFriendship, getMaxFriendship } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatDelta, formatHMS, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function GalaxyMePage({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const stat = G.runtime.leftStat;
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   const [maxFriendship, friendshipDetail] = getMaxFriendship(G.save.state);
   let friendshipCount = 0;
   return (
      <SidebarComp
         title={
            <div className="row">
               <TextureComp name={`Galaxy/${planet.texture}`} />
               <div className="f1">You</div>
            </div>
         }
      >
         <div className="h10" />
         <FloatingTip
            w={350}
            label={
               <>
                  <div>
                     You can have maximum <b>{maxFriendship}</b> friendships, determined as follows
                  </div>
                  <div className="h5" />
                  <div className="flex-table mx-10">
                     {friendshipDetail.map((detail) => (
                        <div className="row" key={detail.name}>
                           <div className="f1">{detail.name}</div>
                           <div>{formatDelta(detail.value)}</div>
                        </div>
                     ))}
                  </div>
               </>
            }
         >
            <div className="title">
               <div className="f1">Friendship Slot</div>
               <div>
                  {getCurrentFriendship(G.save)}/{maxFriendship}
               </div>
            </div>
         </FloatingTip>
         <div className="divider my10" />
         <div className="mx10">
            {G.save.data.galaxy.starSystems.map((starSystem) => {
               if (!starSystem.discovered) {
                  return null;
               }
               return starSystem.planets.map((planet) => {
                  if (planet.friendshipTimeLeft <= 0) {
                     return null;
                  }
                  ++friendshipCount;
                  return (
                     <div
                        className="row pointer"
                        key={planet.id}
                        onClick={() => {
                           playClick();
                           G.scene.getCurrent(GalaxyScene)?.select(planet.id);
                        }}
                     >
                        <TextureComp name={`Galaxy/${planet.texture}`} />
                        <div className="f1">{planet.name}</div>
                        <div>{formatHMS(planet.friendshipTimeLeft * SECOND)}</div>
                     </div>
                  );
               });
            })}
            {friendshipCount === 0 ? (
               <div className="text-sm">You don't have any friendship yet - declare friendship for rewards</div>
            ) : null}
         </div>
         <div className="divider my10" />
         <FloatingTip
            label={
               <>
                  <div>
                     Current Warmonger Penalty is <b>{getWarmongerPenalty(G.save.state)}</b> ( rounded up from{" "}
                     <b className="text-tabular-nums">{warmongerPenalty.toFixed(3)}</b>). It is increased when you
                     declare war. It makes declaring further wars and declaring friendship more expensive
                  </div>
                  <div className="divider mx-10 my5" />
                  <div>
                     Warmonger Penalty is decreased by <b>{stat.warmongerDecrease.value}/s</b> until it reaches 0,
                     detailed as follows
                  </div>
                  <div className="flex-table mx-10 mt5">
                     {stat.warmongerDecrease.detail.map((m) => (
                        <div className="row" key={m.source}>
                           <div className="f1">{m.source}</div>
                           <div>{m.value}</div>
                        </div>
                     ))}
                  </div>
               </>
            }
         >
            <div className="title">
               <div className="f1">Warmonger Penalty</div>
               <div>
                  {warmongerPenalty > 0 ? (
                     <span className="text-xs text-green">({-G.runtime.leftStat.warmongerDecrease.value}/s) </span>
                  ) : null}
                  {Math.ceil(warmongerPenalty)}
               </div>
            </div>
         </FloatingTip>
         <div className="divider my10" />
         <div className="mx10">
            <div className="text-sm">
               Warmonger Penalty is decreased by <b>{stat.warmongerDecrease.value}/s</b> until it reaches 0, detailed as
               follows
            </div>
            <div className="panel space text-sm mt5 p5">
               {stat.warmongerDecrease.detail.map((m) => (
                  <div className="row" key={m.source}>
                     <div className="f1">{m.source}</div>
                     <div>{m.value}</div>
                  </div>
               ))}
            </div>
         </div>
         <div className="divider my10" />
         <div className="title">
            <div className="f1">Backstabber Penalty</div>
            <div>{getStat("Backstabber", G.save.state.stats)}</div>
         </div>
         <div className="divider my10" />
      </SidebarComp>
   );
}
