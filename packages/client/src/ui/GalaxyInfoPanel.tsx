import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getCurrentFriendship, getMaxFriendship } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { FriendshipSlotTooltip } from "./FriendshipSlotTooltip";
import { WarmongerPenaltyTooltip } from "./WarmongerPenaltyTooltip";

export function GalaxyInfoPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const stat = G.runtime.leftStat;
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   const [maxFriendship] = getMaxFriendship(G.save.state);

   return (
      <div className="top-left-panel text-sm">
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
               <div className="f1">Warmonger Penalty</div>
               <div>
                  {warmongerPenalty > 0 ? (
                     <span className="text-xs text-green">({-G.runtime.leftStat.warmongerDecrease.value}/s) </span>
                  ) : null}
                  {Math.ceil(warmongerPenalty)}
               </div>
            </div>
         </FloatingTip>
         <div className="row">
            <div className="f1">Backstabber Penalty</div>
            <div>{getStat("Backstabber", G.save.state.stats)}</div>
         </div>
      </div>
   );
}
