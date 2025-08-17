import { ClientTickInterval } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { isQualifierBattle } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { hasFlag, MINUTE, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ChooseElementModal } from "./ui/ChooseElementModal";
import { isLoading } from "./ui/components/LoadingComp";
import { OfflineTimeModal } from "./ui/OfflineTimeModal";
import { PrepareForBattleModal } from "./ui/PrepareForBattleModal";
import { PrepareForBattleMode } from "./ui/PrepareForBattleMode";
import { tickActions } from "./utils/actions/Actions";
import { G } from "./utils/Global";
import { hasModalOpen } from "./utils/ModalManager";
import { showModal } from "./utils/ToggleModal";

let clientTimer = ClientTickInterval;

export function clientUpdate(dt: number): void {
   tickActions(dt);

   while (clientTimer >= ClientTickInterval) {
      clientTimer -= ClientTickInterval;
      update();
   }
   clientTimer += dt;
}

function update(): void {
   const choice = G.save.state.elementChoices[0];
   if (!hasModalOpen() && !isLoading() && choice) {
      showModal({
         children: <ChooseElementModal choice={choice} permanent={false} />,
         size: "xl",
      });
      return;
   }
   if (G.save.state.offlineTime > MINUTE) {
      const offlineTime = G.save.state.offlineTime;
      G.save.state.offlineTime = 0;
      showModal({
         title: t(L.OfflineTime),
         children: <OfflineTimeModal offlineTime={offlineTime} />,
         size: "sm",
      });
      return;
   }

   if (
      !hasModalOpen() &&
      !isLoading() &&
      !hasFlag(G.save.state.flags, GameStateFlags.QualifierBattlePrompted) &&
      isQualifierBattle(G.save.state)
   ) {
      G.save.state.flags = setFlag(G.save.state.flags, GameStateFlags.QualifierBattlePrompted);
      showModal({
         children: <PrepareForBattleModal mode={PrepareForBattleMode.Prompt} />,
         size: "sm",
         dismiss: true,
      });
      return;
   }
}
