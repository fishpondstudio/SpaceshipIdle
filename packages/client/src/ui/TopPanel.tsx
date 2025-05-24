import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BattlePanel } from "./BattlePanel";
import { ResourcePanel } from "./ResourcePanel";
import { ShipInfoPanel } from "./ShipInfoPanel";

export function TopPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   if (!G.save) return null;
   if (G.runtime.battleType === BattleType.Peace) {
      return (
         <>
            <ShipInfoPanel />
            <ResourcePanel />
         </>
      );
   }
   return (
      <>
         <BattlePanel side={Side.Left} />
         <BattlePanel side={Side.Right} />
      </>
   );
}
