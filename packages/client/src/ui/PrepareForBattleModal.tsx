import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getQuantumQualified } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { resolveIn } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { loadGameStateFromFile } from "../game/LoadSave";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { MatchMakingModal } from "./MatchmakingModal";
import { PrestigeModal } from "./PrestigeModal";
import { playClick, playError } from "./Sound";

export function PrepareForBattleModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <div style={{ padding: 5 }}>
         <div className="text-dimmed text-sm">{t(L.QuantumQualifierDesc)}</div>
         <div className="h10" />
         <div className="text-dimmed text-sm">{t(L.QuantumMatchmakingDesc)}</div>
         <div
            className="mi pointer mb10 mt5"
            onClick={async () => {
               playClick();
               const enemy = await loadGameStateFromFile();
               showLoading();
               setTimeout(() => {
                  hideLoading();
                  showModal({
                     children: <MatchMakingModal enemy={enemy} />,
                     size: "lg",
                     dismiss: true,
                  });
               }, 1000);
            }}
         >
            folder_open
         </div>
         <button
            className="btn filled w100 py5 px10 text-lg"
            onClick={async () => {
               try {
                  playClick();
                  showLoading();
                  const ship = await RPCClient.findShip(getQuantumQualified(G.save.current), [0.75, 1.1]);
                  await resolveIn(1, null);
                  hideLoading();
                  showModal({
                     children: <MatchMakingModal enemy={ship.json} />,
                     size: "lg",
                     dismiss: true,
                  });
               } catch (e) {
                  playError();
                  hideLoading();
                  notifications.show({ position: "top-center", color: "red", message: String(e) });
               }
            }}
         >
            {t(L.FindOpponent)}
         </button>
         <div className="h10" />
         <button
            className="btn w100 p5 row text-lg"
            onClick={() => {
               showModal({
                  children: <PrestigeModal defeated={false} showClose={true} />,
                  size: "sm",
                  dismiss: true,
               });
            }}
         >
            {t(L.PrestigeAnyway)}
         </button>
      </div>
   );
}
