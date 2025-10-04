import { Indicator } from "@mantine/core";
import { GameStateFlags, GameStateUpdated, StopWarpCondition } from "@spaceship-idle/shared/src/game/GameState";
import { showSuccess } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import {
   canClaimConquestReward,
   canExploreAnyPlanet,
   findClosestUndiscoveredStarSystem,
   findStarSystem,
   getCurrentFriendship,
   getGalaxyLocations,
   getMaxFriendship,
} from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getStat, resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { TextureComp } from "./components/TextureComp";
import { FriendshipSlotTooltip } from "./FriendshipSlotTooltip";
import { playClick } from "./Sound";
import { WarmongerPenaltyRowComp } from "./WarmongerPenaltyRowComp";
import { WarmongerPenaltyTooltip } from "./WarmongerPenaltyTooltip";

export function GalaxyInfoPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [maxFriendship] = getMaxFriendship(G.save.state);
   const locations = getGalaxyLocations(G.save.data.galaxy);
   const canExplorePlanet = canExploreAnyPlanet(G.save.data.galaxy);
   const closestUndiscoveredStarSystem = findClosestUndiscoveredStarSystem(G.save.data.galaxy);
   const rawWarmongerPenalty = getStat("Warmonger", G.save.state.stats);

   return (
      <div className="top-left-panel text-sm">
         <div className="flex-table g50">
            <FloatingTip w={350} label={<FriendshipSlotTooltip />}>
               <div className="row">
                  <div className="f1">{t(L.FriendshipSlot)}</div>
                  <div>
                     {getCurrentFriendship(G.save)}/{maxFriendship}
                  </div>
               </div>
            </FloatingTip>
            <FloatingTip label={<WarmongerPenaltyTooltip />}>
               <div className="row fstart">
                  <WarmongerPenaltyRowComp />
               </div>
            </FloatingTip>
            {rawWarmongerPenalty > G.runtime.leftStat.warmongerMin.value &&
            resourceOf("Warp", G.save.state.resources).current > 0 ? (
               <div className="row" onClick={() => {}}>
                  <div className="f1">
                     <div>8x Warp Speed Until</div>
                     <div className="h5" />
                     <div>
                        <FloatingTip label={t(L.Set8xWarpSpeedUntilWarmongerPenaltyReaches0)}>
                           <button
                              className="btn w100 text-left"
                              onClick={() => {
                                 playClick();
                                 G.save.state.flags = setFlag(G.save.state.flags, GameStateFlags.UsedWarp);
                                 G.save.state.stopWarpCondition = StopWarpCondition.Zero;
                                 G.speed = 8;
                                 showSuccess(t(L.Set8xWarpSpeedUntilWarmongerPenaltyReaches0));
                                 GameStateUpdated.emit();
                              }}
                           >
                              <div className="mi sm inline">play_circle</div> Warmonger Penalty = 0
                           </button>
                        </FloatingTip>
                     </div>
                     <div className="h5" />
                     <div>
                        <FloatingTip label={t(L.Set8xWarpSpeedUntilWarmongerPenaltyReachesMin)}>
                           <button
                              className="btn w100 text-left"
                              onClick={() => {
                                 playClick();
                                 G.save.state.flags = setFlag(G.save.state.flags, GameStateFlags.UsedWarp);
                                 G.save.state.stopWarpCondition = StopWarpCondition.Minimum;
                                 G.speed = 8;
                                 showSuccess(t(L.Set8xWarpSpeedUntilWarmongerPenaltyReachesMin));
                                 GameStateUpdated.emit();
                              }}
                           >
                              <div className="mi sm inline">play_circle</div> Warmonger Penalty = Min
                           </button>
                        </FloatingTip>
                     </div>
                  </div>
               </div>
            ) : null}
            <div className="row">
               <div className="f1">{t(L.BackstabberPenalty)}</div>
               <div>{getStat("Backstabber", G.save.state.stats)}</div>
            </div>
         </div>
         <div className="h10" />
         {locations.map((location) => {
            const starSystem = findStarSystem(location.id, G.save.data.galaxy);
            const canClaimReward = starSystem && canClaimConquestReward(starSystem);
            const canExplore = canExplorePlanet && closestUndiscoveredStarSystem === starSystem;
            return (
               <FloatingTip
                  key={location.id}
                  label={
                     <>
                        <div>{location.tooltip}</div>
                        {canClaimReward ? (
                           <div className="text-green">{t(L.YouHaveAvailableConquestRewardTooltip)}</div>
                        ) : null}
                        {canExplore ? (
                           <div className="text-green">{t(L.YouCanExploreANewStarSystemTooltip)}</div>
                        ) : null}
                     </>
                  }
               >
                  <div
                     className="row hover-highlight pointer"
                     onClick={() => {
                        playClick();
                        G.scene.getCurrent(GalaxyScene)?.select(location.id).lookAt(location.id);
                     }}
                  >
                     <div />
                     <div>{location.name}</div>
                     {canClaimReward || canExplore ? <Indicator color="red" processing /> : null}
                     <div className="f1" />
                     {location.texture ? (
                        <TextureComp name={`Galaxy/${location.texture}`} />
                     ) : (
                        <div className="mi">indeterminate_question_box</div>
                     )}
                  </div>
               </FloatingTip>
            );
         })}
      </div>
   );
}
