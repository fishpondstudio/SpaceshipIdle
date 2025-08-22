import { ClientTickInterval } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { MINUTE } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ChooseElementModal } from "./ui/ChooseElementModal";
import { isLoading } from "./ui/components/LoadingComp";
import { OfflineTimeModal } from "./ui/OfflineTimeModal";
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
   const choice = G.save.data.elementChoices[0];
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
}
