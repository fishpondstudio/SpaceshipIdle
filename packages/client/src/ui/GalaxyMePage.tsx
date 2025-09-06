import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getCurrentFriendship, getMaxFriendship } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatHMS, range, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { FriendshipSlotTooltip } from "./FriendshipSlotTooltip";
import { WarmongerPenaltyTooltip } from "./GalaxyInfoPanel";
import { playClick } from "./Sound";

export function GalaxyMePage({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   const [maxFriendship, friendshipDetail] = getMaxFriendship(G.save.state);
   const friends: Planet[] = [];
   const friendCount = getCurrentFriendship(G.save, friends);
   let warCount = 0;
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
         <FloatingTip w={350} label={<FriendshipSlotTooltip />}>
            <div className="title">
               <div className="f1">Friendship Slot</div>
               <div>
                  {friendCount}/{maxFriendship}
               </div>
            </div>
         </FloatingTip>
         <div className="divider my10" />
         <div className="mx10" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {range(0, maxFriendship).map((i) => {
               if (i < friendCount) {
                  return (
                     <FloatingTip
                        key={i}
                        w={300}
                        label={
                           <>
                              <div className="row g5">
                                 <TextureComp name={`Galaxy/${planet.texture}`} />
                                 <div className="f1 text-md text-space">{planet.name}</div>
                              </div>
                              <div className="h5" />
                              <div className="row">
                                 <div className="f1">{t(L.TimeLeft)}</div>
                                 <div>{formatHMS(planet.friendshipTimeLeft * SECOND)}</div>
                              </div>
                           </>
                        }
                     >
                        <div
                           className="cc pointer"
                           style={{
                              border: "1px solid var(--mantine-color-dark-4)",
                              borderRadius: "var(--mantine-radius-default)",
                              aspectRatio: "1/1",
                           }}
                           onClick={() => {
                              playClick();
                              G.scene.getCurrent(GalaxyScene)?.select(friends[i].id);
                           }}
                        >
                           <TextureComp width={48} name={`Galaxy/${friends[i].texture}`} />
                        </div>
                     </FloatingTip>
                  );
               }
               return (
                  <FloatingTip key={i} label={t(L.YouHaveAvailableFriendshipTooltip)}>
                     <div
                        className="cc"
                        style={{
                           border: "1px solid var(--mantine-color-dark-4)",
                           borderRadius: "var(--mantine-radius-default)",
                           aspectRatio: "1/1",
                        }}
                     >
                        <div className="mi">question_mark</div>
                     </div>
                  </FloatingTip>
               );
            })}
         </div>
         <div className="divider my10" />
         <div className="title">Past Wars</div>
         <div className="divider my10" />
         <div className="mx10" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {G.save.data.galaxy.starSystems.map((starSystem) => {
               return starSystem.planets.map((planet) => {
                  if (!planet.battleResult) {
                     return null;
                  }
                  ++warCount;
                  return (
                     <FloatingTip
                        key={planet.id}
                        w={300}
                        label={
                           <>
                              <div className="row g5">
                                 <TextureComp name={`Galaxy/${planet.texture}`} />
                                 <div className="f1 text-md text-space">{planet.name}</div>
                              </div>
                              <div className="h5" />
                              <div className="row">
                                 <div className="f1">
                                    {BattleVictoryTypeLabel[getVictoryType(planet.battleResult.battleScore)]()}
                                 </div>
                                 <div>{planet.battleResult.battleScore}%</div>
                              </div>
                           </>
                        }
                     >
                        <div
                           className="cc pointer"
                           style={{
                              border: "1px solid var(--mantine-color-dark-4)",
                              borderRadius: "var(--mantine-radius-default)",
                              aspectRatio: "1/1",
                           }}
                           onClick={() => {
                              playClick();
                              G.scene.getCurrent(GalaxyScene)?.select(planet.id);
                           }}
                        >
                           <TextureComp width={48} name={`Galaxy/${planet.texture}`} />
                        </div>
                     </FloatingTip>
                  );
               });
            })}
         </div>
         {warCount === 0 ? (
            <div className="mx10 text-dimmed text-sm">
               <div className="mi sm inline mr5">info</div>
               You haven't declared any war yet
            </div>
         ) : null}
         <div className="divider my10" />
         <FloatingTip label={<WarmongerPenaltyTooltip />}>
            <div className="row mx10">
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
         <div className="row mx10">
            <div className="f1">Backstabber Penalty</div>
            <div>{getStat("Backstabber", G.save.state.stats)}</div>
         </div>
         <div className="divider my10" />
      </SidebarComp>
   );
}
