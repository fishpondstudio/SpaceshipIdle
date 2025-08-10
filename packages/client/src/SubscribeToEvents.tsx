import { notifications } from "@mantine/notifications";
import type { Resource } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { OnBattleStatusChanged } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { clearFlag, mapSafeAdd } from "@spaceship-idle/shared/src/utils/Helper";
import { saveGame } from "./game/LoadSave";
import { onSteamClose } from "./rpc/SteamClient";
import { PracticeBattleResultModal } from "./ui/PracticeBattleResultModal";
import { QualifierBattleResultModal } from "./ui/QualifierBattleResultModal";
import { G } from "./utils/Global";
import { SteamClient } from "./utils/Steam";
import { showModal } from "./utils/ToggleModal";

export function subscribeToEvents(): void {
   OnBattleStatusChanged.on(({ status, prevStatus }) => {
      if (prevStatus === BattleStatus.InProgress && status !== BattleStatus.InProgress) {
         let modal: React.ReactNode = null;
         switch (G.runtime.battleType) {
            case BattleType.Qualifier: {
               modal = <QualifierBattleResultModal />;
               if (G.runtime.battleStatus === BattleStatus.RightWin) {
                  mapSafeAdd<Resource>(G.save.current.resources, "Defeat", 1);
               } else {
                  mapSafeAdd<Resource>(G.save.current.resources, "Victory", 1);
               }
               G.save.current.flags = clearFlag(G.save.current.flags, GameStateFlags.QualifierBattlePrompted);
               break;
            }
            case BattleType.Practice: {
               modal = <PracticeBattleResultModal />;
               break;
            }
         }

         G.speed = 0;
         saveGame(G.save);
         showModal({
            children: modal,
            size: "sm",
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
