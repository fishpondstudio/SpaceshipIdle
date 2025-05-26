import { Paper, Progress, SegmentedControl } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { round } from "@spaceship-idle/shared/src/utils/Helper";
import { memo } from "react";
import { ElementsScene } from "../scenes/ElementsScene";
import { ShipScene } from "../scenes/ShipScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { OnSceneSwitched } from "../utils/SceneManager";
import { Scenes } from "../utils/Scenes";
import { showModal } from "../utils/ToggleModal";
import { ChooseElementModal } from "./ChooseElementModal";
import { hideSidebar } from "./Sidebar";
import { playClick } from "./Sound";

const speedWidth = 300;
function _SpeedSwitcher({ speed }: { speed: number }): React.ReactNode {
   return (
      <Paper
         style={{ position: "absolute", width: speedWidth, bottom: 10, left: `calc(50vw - ${speedWidth / 2}px)` }}
         withBorder
      >
         <SegmentedControl
            style={{ width: speedWidth - 2 }}
            onChange={(value) => {
               G.speed = round(Number.parseFloat(value), 1);
               GameStateUpdated.emit();
            }}
            value={String(speed)}
            data={[
               { label: "0.5x", value: "0.5" },
               { label: "1x", value: "1" },
               { label: "2x", value: "2" },
               { label: "4x", value: "4" },
               { label: "8x", value: "8" },
            ]}
         />
      </Paper>
   );
}

const sceneWidth = 330;

function _SceneSwitcher(): React.ReactNode {
   refreshOnTypedEvent(OnSceneSwitched);
   return (
      <>
         <div
            className="row panel g5"
            style={{
               position: "absolute",
               width: sceneWidth,
               bottom: 55,
               padding: "5px 6px",
               left: `calc(50vw - ${sceneWidth / 2}px)`,
               background: "var(--mantine-color-dark-8)",
            }}
         >
            <div className="mi lg">flag</div>
            <div className="f1 text-sm">
               Build 5 Spaceship Modules
               <Progress value={50} />
               <div className="h5" />
            </div>
            <div className="mi pointer">unfold_more</div>
         </div>
         <SegmentedControl
            style={{
               position: "absolute",
               width: sceneWidth,
               bottom: 10,
               left: `calc(50vw - ${sceneWidth / 2}px)`,
               border: "1px solid var(--mantine-color-default-border)",
            }}
            onChange={(value) => {
               playClick();
               hideSidebar();
               switch (value) {
                  case Scenes.ShipScene:
                     G.scene.loadScene(ShipScene);
                     break;
                  case Scenes.TechTreeScene:
                     G.scene.loadScene(TechTreeScene);
                     break;
                  case Scenes.ElementsScene:
                     G.scene.loadScene(ElementsScene);
                     if (G.save.options.elementChoices.length > 0) {
                        showModal({
                           children: <ChooseElementModal choice={G.save.options.elementChoices[0]} permanent={true} />,
                           size: "xl",
                        });
                     }
                     break;
               }
            }}
            value={G.scene?.currentSceneId ?? Scenes.ShipScene}
            data={[
               { label: "Spaceship", value: Scenes.ShipScene },
               { label: "Research", value: Scenes.TechTreeScene },
               { label: "Elements", value: Scenes.ElementsScene },
            ]}
         />
      </>
   );
}

const SceneSwitcher = memo(_SceneSwitcher);
const SpeedSwitcher = memo(_SpeedSwitcher, (prev, next) => prev.speed === next.speed);

export function BottomPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (!G.runtime) {
      return null;
   }
   switch (G.runtime.battleType) {
      case BattleType.Peace:
         return <SceneSwitcher />;
      default:
         return <SpeedSwitcher speed={G.speed} />;
   }
}
