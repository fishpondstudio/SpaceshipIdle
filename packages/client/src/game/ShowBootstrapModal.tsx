import type { SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ChooseElementModal } from "../ui/ChooseElementModal";
import { NewPlayerModal } from "../ui/NewPlayerModal";
import { showModal } from "../utils/ToggleModal";

export function showBootstrapModal(save: SaveGame, isNewPlayer: boolean): void {
   if (isNewPlayer) {
      showModal({
         children: <NewPlayerModal />,
         size: "md",
         title: t(L.WelcomeToSpaceshipIdle),
         dismiss: true,
      });
      return;
   }

   if (save.options.elementChoices.length > 0) {
      showModal({
         children: <ChooseElementModal choice={save.options.elementChoices[0]} permanent={true} />,
         size: "xl",
      });
      return;
   }
}
