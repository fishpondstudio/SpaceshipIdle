import { Indicator } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   canClaimConquestReward,
   canExploreAnyPlanet,
   findClosestUndiscoveredStarSystem,
   findStarSystem,
   getCurrentFriendship,
   getGalaxyLocations,
   getMaxFriendship,
} from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { FloatingTip } from "./components/FloatingTip";
import { TextureComp } from "./components/TextureComp";
import { FriendshipSlotTooltip } from "./FriendshipSlotTooltip";
import { playClick } from "./Sound";
import { WarmongerPenaltyRowComp } from "./WarmongerPenaltyRowComp";
import { WarmongerPenaltyTooltip } from "./WarmongerPenaltyTooltip";
import { WarpPenaltyModal } from "./WarpPenaltyModal";

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
            {rawWarmongerPenalty > G.runtime.leftStat.warmongerMin.value ? (
               <div
                  className="row pointer"
                  onClick={() =>
                     showModal({ title: "Warp Penalty", children: <WarpPenaltyModal />, size: "sm", dismiss: true })
                  }
               >
                  <div className="f1">Warp Penalty</div>
                  <TextureComp name="Others/Warp16" className="mx-5" />
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
