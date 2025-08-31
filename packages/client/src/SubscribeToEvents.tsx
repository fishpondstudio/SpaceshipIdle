import type { MantineColor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { OnAlert, showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
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
                     battleInfo={G.runtime.battleInfo}
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

   OnAlert.on(({ message, type, persist }) => {
      let color: MantineColor;
      switch (type) {
         case "info":
            color = "blue";
            break;
         case "success":
            color = "green";
            break;
         case "warning":
            color = "yellow";
            break;
         case "error":
            color = "red";
            break;
         default:
            color = "blue";
            break;
      }

      notifications.show({
         message,
         position: "top-center",
         color,
         withBorder: true,
      });
      if (persist) {
         G.save.data.alerts.unshift({ message, type, time: Date.now() });
         while (G.save.data.alerts.length > 100) {
            G.save.data.alerts.pop();
         }
      }
   });

   onSteamClose(async () => {
      await saveGame(G.save);
      SteamClient.quit();
   });

   window.addEventListener("error", (event) => {
      showError(String(event.message));
   });

   window.addEventListener("unhandledrejection", (event) => {
      showError(String(event.reason));
   });
}
