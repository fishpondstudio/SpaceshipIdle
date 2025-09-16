import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   getCurrentFriendship,
   getGalaxyLocations,
   getMaxFriendship,
} from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { TextureComp } from "./components/TextureComp";
import { FriendshipSlotTooltip } from "./FriendshipSlotTooltip";
import { playClick } from "./Sound";
import { WarmongerPenaltyTooltip } from "./WarmongerPenaltyTooltip";

export function GalaxyInfoPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   const [maxFriendship] = getMaxFriendship(G.save.state);
   const locations = getGalaxyLocations(G.save.data.galaxy);
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
               <div className="row">
                  <div className="f1">{t(L.WarmongerPenalty)}</div>
                  <div>
                     {warmongerPenalty > 0 ? (
                        <span className="text-xs text-green">({-G.runtime.leftStat.warmongerDecrease.value}/s) </span>
                     ) : null}
                     {Math.ceil(warmongerPenalty)}
                  </div>
               </div>
            </FloatingTip>
            <div className="row">
               <div className="f1">{t(L.BackstabberPenalty)}</div>
               <div>{getStat("Backstabber", G.save.state.stats)}</div>
            </div>
         </div>
         <div className="h10" />
         {locations.map((location) => (
            <FloatingTip key={location.id} label={location.tooltip}>
               <div
                  className="row hover-highlight pointer"
                  onClick={() => {
                     playClick();
                     G.scene.getCurrent(GalaxyScene)?.select(location.id).lookAt(location.id);
                  }}
               >
                  <div />
                  <div className="f1">{location.name}</div>
                  {location.texture ? (
                     <TextureComp name={`Galaxy/${location.texture}`} />
                  ) : (
                     <div className="mi">indeterminate_question_box</div>
                  )}
               </div>
            </FloatingTip>
         ))}
      </div>
   );
}
