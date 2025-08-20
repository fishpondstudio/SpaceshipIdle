import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { ElementsScene } from "../scenes/ElementsScene";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { OnSceneSwitched } from "../utils/SceneManager";
import { BattlePanel, TimerPanel } from "./BattlePanel";
import { ElementStatsPanel } from "./ElementStatsPanel";
import { GalaxyInfoPanel } from "./GalaxyInfoPanel";
import { ShipInfoPanel } from "./ShipInfoPanel";
import { TopLeftPanel } from "./TopLeftPanel";
import { TopRightPanel } from "./TopRightPanel";

export function TopPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   refreshOnTypedEvent(OnSceneSwitched);
   if (!G.save) return null;
   if (G.scene.isCurrent(TechTreeScene)) {
      return <ShipInfoPanel />;
   }
   if (G.scene.isCurrent(ElementsScene)) {
      return (
         <>
            <ElementStatsPanel />
            <ShipInfoPanel />
         </>
      );
   }
   if (G.scene.isCurrent(GalaxyScene)) {
      return (
         <>
            <GalaxyInfoPanel />
            <ShipInfoPanel />
         </>
      );
   }
   if (G.runtime.battleType === BattleType.Peace) {
      return (
         <>
            <TopLeftPanel />
            <TopRightPanel />
            <ShipInfoPanel />
         </>
      );
   }
   return (
      <>
         <BattlePanel side={Side.Left} />
         <TimerPanel />
         <BattlePanel side={Side.Right} />
      </>
   );
}
