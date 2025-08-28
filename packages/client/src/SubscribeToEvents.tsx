import { notifications } from "@mantine/notifications";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { calcSpaceshipXP, changeStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { OnBattleStatusChanged } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { saveGame } from "./game/LoadSave";
import { onSteamClose } from "./rpc/SteamClient";
import { PeaceTreatyModal } from "./ui/PeaceTreatyModal";
import { G } from "./utils/Global";
import { SteamClient } from "./utils/Steam";
import { showModal } from "./utils/ToggleModal";

export function subscribeToEvents(): void {
   OnBattleStatusChanged.on(({ status, prevStatus }) => {
      if (prevStatus === BattleStatus.InProgress && status !== BattleStatus.InProgress) {
         let modal: React.ReactNode = null;
         switch (G.runtime.battleType) {
            case BattleType.Battle: {
               const stat = G.runtime.leftStat;
               modal = (
                  <PeaceTreatyModal
                     battleScore={Math.round((100 * stat.currentHp) / stat.maxHp)}
                     name={G.runtime.right.name}
                     enemyXP={calcSpaceshipXP(G.runtime.original.right)}
                  />
               );
               if (G.runtime.battleStatus === BattleStatus.RightWin) {
                  changeStat("Defeat", 1, G.save.state.stats);
               } else {
                  changeStat("Victory", 1, G.save.state.stats);
               }
               break;
            }
         }

         G.speed = 0;
         saveGame(G.save);
         showModal({
            children: modal,
            size: "lg",
            dismiss: false,
         });
      }
   });

   onSteamClose(async () => {
      await saveGame(G.save);
      SteamClient.quit();
   });

   window.addEventListener("error", (event) => {
      notifications.show({
         message: String(event.message),
         position: "top-center",
         color: "red",
         withBorder: true,
      });
   });

   window.addEventListener("unhandledrejection", (event) => {
      notifications.show({
         message: String(event.reason),
         position: "top-center",
         color: "red",
         withBorder: true,
      });
   });
}
