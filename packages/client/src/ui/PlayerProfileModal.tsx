import { TextInput } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { saveGameStateToFile } from "../game/LoadSave";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ChangePlayerHandleComp } from "./ChangePlayerHandleComp";

export function PlayerProfileModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <>
         <div className="text-sm text-dimmed text-uppercase">{t(L.ShipName)}</div>
         <div className="row">
            <TextInput
               leftSection="SS"
               className="f1"
               value={G.save.current.name}
               onChange={(e) => {
                  G.save.current.name = e.target.value;
                  GameStateUpdated.emit();
               }}
            />
            <button
               className="btn stretch"
               onClick={() => {
                  saveGameStateToFile(G.save.current);
               }}
            >
               {t(L.ExportSpaceship)}
            </button>
         </div>
         <div className="divider dashed my10 mx-10" />
         <ChangePlayerHandleComp />
      </>
   );
}
