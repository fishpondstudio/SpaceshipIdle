import { Indicator, Progress, SegmentedControl, Tooltip } from "@mantine/core";
import { GameState, GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { hasUnequippedBooster } from "@spaceship-idle/shared/src/game/logic/BoosterLogic";
import { hasUnassignedElements } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { formatNumber, hasFlag, round } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { getCurrentTutorial } from "../game/Tutorial";
import { CatalystScene } from "../scenes/CatalystScene";
import { ElementsScene } from "../scenes/ElementsScene";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { ShipScene } from "../scenes/ShipScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { OnSceneSwitched } from "../utils/SceneManager";
import { Scenes } from "../utils/Scenes";
import { showModal } from "../utils/ToggleModal";
import { BoosterPage } from "./BoosterPage";
import { ChooseElementModal } from "./ChooseElementModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { DirectivePage } from "./DirectivePage";
import { hideSidebar, setSidebar } from "./Sidebar";
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

const sceneWidth = 60 * 5;

function Tutorial(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (!hasFlag(G.save.state.flags, GameStateFlags.ShowTutorial)) {
      return null;
   }
   const tutorial = getCurrentTutorial();
   if (!tutorial) {
      return null;
   }
   const [progress, total] = tutorial.progress(G.save.state);
   return (
      <div
         className="row panel g5"
         style={{
            position: "absolute",
            width: sceneWidth,
            bottom: 67,
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
            maw="25vw"
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
            styles={{
               label: { overflow: "visible", padding: "5px 0" },
               innerLabel: { display: "flex", justifyContent: "center" },
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
                  case Scenes.CatalystScene:
                     G.scene.loadScene(CatalystScene);
                     break;
                  case Scenes.GalaxyScene:
                     G.scene.loadScene(GalaxyScene);
                     break;
                  case BoosterPage.name:
                     setSidebar(<BoosterPage />);
                     break;
                  case DirectivePage.name:
                     setSidebar(<DirectivePage />);
                     break;
                  case Scenes.ElementsScene:
                     G.scene.loadScene(ElementsScene);
                     if (G.save.data.permanentElementChoices.length > 0) {
                        showModal({
                           children: (
                              <ChooseElementModal choice={G.save.data.permanentElementChoices[0]} permanent={true} />
                           ),
                           size: "xl",
                        });
                     }
                     break;
               }
            }}
            value={G.scene?.currentSceneId ?? Scenes.ShipScene}
            data={[
               {
                  label: (
                     <Tooltip label={t(L.TabSpaceship)}>
                        <TextureComp name="Others/Spaceship24" />
                     </Tooltip>
                  ),
                  value: Scenes.ShipScene,
               },
               {
                  label: (
                     <Tooltip label={t(L.TabResearch)}>
                        <TextureComp name="Others/Research24" />
                     </Tooltip>
                  ),
                  value: Scenes.TechTreeScene,
               },
               {
                  label: (
                     <Tooltip label={t(L.TabGalaxy)}>
                        <TextureComp name="Others/Galaxy24" />
                     </Tooltip>
                  ),
                  value: Scenes.GalaxyScene,
               },
               {
                  label: (
                     <Tooltip label={t(L.TabCatalyst)}>
                        <TextureComp name="Others/Catalyst24" />
                     </Tooltip>
                  ),
                  value: Scenes.CatalystScene,
               },
               {
                  label: (
                     <Tooltip label={t(L.TabDirective)}>
                        <TextureComp name="Others/Directive24" />
                     </Tooltip>
                  ),
                  value: DirectivePage.name,
               },
               {
                  label: <BoosterTabLabel />,
                  value: BoosterPage.name,
               },
               {
                  label: <ElementTabLabel />,
                  value: Scenes.ElementsScene,
               },
            ]}
         />
      </>
   );
}

function ElementTabLabel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (hasUnassignedElements(G.save.state)) {
      return (
         <Tooltip multiline maw="25vw" label={t(L.YouHaveUnassignedElementTooltip)}>
            <Indicator color="red" processing>
               <TextureComp name="Others/Element24" />
            </Indicator>
         </Tooltip>
      );
   }
   return (
      <Tooltip label={t(L.TabElement)}>
         <TextureComp name="Others/Element24" />
      </Tooltip>
   );
}

function BoosterTabLabel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (hasUnequippedBooster(G.save.state)) {
      return (
         <Tooltip multiline maw="25vw" label={t(L.YouHaveUnequippedBoosterTooltip)}>
            <Indicator color="red" processing>
               <TextureComp id="bottom-panel-booster" name="Others/Booster24" />
            </Indicator>
         </Tooltip>
      );
   }
   return (
      <Tooltip label={t(L.TabBooster)}>
         <TextureComp id="bottom-panel-booster" name="Others/Booster24" />
      </Tooltip>
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
