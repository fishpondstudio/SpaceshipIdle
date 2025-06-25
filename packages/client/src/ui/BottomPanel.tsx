import { Progress, SegmentedControl, Tooltip } from "@mantine/core";
import { GameState, GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { formatNumber, hasFlag, round } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { getCurrentTutorial } from "../game/Tutorial";
import { ElementsScene } from "../scenes/ElementsScene";
import { ShipScene } from "../scenes/ShipScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { OnSceneSwitched } from "../utils/SceneManager";
import { Scenes } from "../utils/Scenes";
import { showModal } from "../utils/ToggleModal";
import { ChooseElementModal } from "./ChooseElementModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { hideSidebar } from "./Sidebar";
import { playClick } from "./Sound";
import { TutorialProgressModal } from "./TutorialProgressModal";

function SpeedSwitcher({ speed }: { speed: number }): React.ReactNode {
   if (G.runtime.battleStatus !== BattleStatus.InProgress) {
      return (
         <button
            className="btn text-lg filled"
            style={{
               padding: "5px 10px",
               position: "absolute",
               bottom: 10,
               left: "50%",
               transform: "translateX(-50%)",
               border: "1px solid var(--mantine-color-default-border)",
            }}
            onClick={() => {
               showLoading();

               G.speed = 1;
               G.runtime = new Runtime(G.save, new GameState());
               G.runtime.battleType = BattleType.Peace;
               G.runtime.createXPTarget();

               GameStateUpdated.emit();
               setTimeout(() => {
                  hideLoading();
                  GameStateUpdated.emit();
               }, 1000);
            }}
         >
            {t(L.ReturnToSpaceship)}
         </button>
      );
   }
   return (
      <SegmentedControl
         style={{
            position: "absolute",
            bottom: 10,
            width: 300,
            left: "50%",
            transform: "translateX(-50%)",
            border: "1px solid var(--mantine-color-default-border)",
         }}
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
   );
}

const sceneWidth = 360;

function Tutorial(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (!hasFlag(G.save.current.flags, GameStateFlags.ShowTutorial)) {
      return null;
   }
   const tutorial = getCurrentTutorial();
   if (!tutorial) {
      return null;
   }
   const [progress, total] = tutorial.progress(G.save.current);
   return (
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
         <Tooltip
            label={
               <>
                  <div>{tutorial.name()}</div>
                  <RenderHTML html={tutorial.desc()} />
               </>
            }
            multiline
            maw="30vw"
         >
            <div className="f1 text-sm" style={{ overflow: "hidden" }}>
               <div className="row">
                  <div
                     className="f1"
                     style={{ minWidth: 0, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
                  >
                     {tutorial.name()}
                  </div>
                  <div>
                     {formatNumber(progress)}/{formatNumber(total)}
                  </div>
               </div>
               <ProgressMemo value={(100 * progress) / total} />
               <div className="h5" />
            </div>
         </Tooltip>
         <div
            className="mi pointer"
            onClick={() => {
               showModal({
                  children: <TutorialProgressModal />,
                  size: "lg",
                  dismiss: true,
                  title: t(L.TutorialProgress),
               });
            }}
         >
            more_vert
         </div>
      </div>
   );
}

const ProgressMemo = memo(Progress, (prev, next) => prev.value === next.value);

function SceneSwitcher(): React.ReactNode {
   refreshOnTypedEvent(OnSceneSwitched);
   return (
      <>
         <Tutorial />
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
                     if (G.save.current.permanentElementChoices.length > 0) {
                        showModal({
                           children: (
                              <ChooseElementModal choice={G.save.current.permanentElementChoices[0]} permanent={true} />
                           ),
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
