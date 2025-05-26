import { notifications } from "@mantine/notifications";
import { GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { OnBattleStatusChanged } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { saveGame } from "./game/LoadSave";
import { onSteamClose } from "./rpc/SteamClient";
import { BattleResultVictoryModal } from "./ui/BattleResultVictoryModal";
import { PracticeBattleResultModal } from "./ui/PracticeBattleResultModal";
import { PrestigeModal } from "./ui/PrestigeModal";
import { SecondChanceBattleResultModal } from "./ui/SecondChanceBattleResultModal";
import { G } from "./utils/Global";
import { SteamClient } from "./utils/Steam";
import { showModal } from "./utils/ToggleModal";

let wave = 1;

export function subscribeToEvents(): void {
   OnBattleStatusChanged.on(({ status, prevStatus }) => {
      if (prevStatus === BattleStatus.InProgress && status !== BattleStatus.InProgress) {
         if (G.runtime.battleType === BattleType.Peace) {
            if (G.runtime.right.tiles.size === 0) {
               G.runtime.createEnemy(++wave);
            }
            return;
         }

         let modal: React.ReactNode = null;
         switch (G.runtime.battleType) {
            case BattleType.Qualifier: {
               if (G.runtime.battleStatus === BattleStatus.RightWin) {
                  if (G.save.current.trialCount === 0) {
                     modal = <SecondChanceBattleResultModal />;
                     G.save.current.trialCount = 1;
                  } else {
                     modal = <PrestigeModal defeated={true} showClose={false} />;
                     G.save.current.flags = setFlag(G.save.current.flags, GameStateFlags.Prestige);
                  }
               } else {
                  modal = <BattleResultVictoryModal />;
                  G.save.current.battleCount++;
                  G.save.current.trialCount = 0;
               }
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
