import { Tooltip } from "@mantine/core";
import { GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { classNames, clearFlag, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { Tutorial } from "../game/Tutorial";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { RenderHTML } from "./components/RenderHTMLComp";
import { playClick } from "./Sound";

export function TutorialProgressModal(): React.ReactNode {
   let unfinished = false;
   return (
      <div className="m10">
         <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Tutorial.map((step, i) => {
               const [progress, total] = step.progress(G.save.state);
               let active = false;
               if (!unfinished && progress < total) {
                  unfinished = true;
                  active = true;
               }
               return (
                  <div className="f1 row" key={i}>
                     {progress >= total && !unfinished ? (
                        <div className="mi fstart text-green">check_circle</div>
                     ) : (
                        <div className="mi fstart">circle</div>
                     )}
                     <div className="f1">
                        <Tooltip.Floating label={<RenderHTML html={step.desc()} />} multiline>
                           <div className={classNames(active ? "text-space" : null)}>{step.name()}</div>
                        </Tooltip.Floating>
                        {active ? (
                           <div className="text-sm text-dimmed">
                              <RenderHTML html={step.desc()} />
                           </div>
                        ) : null}
                     </div>
                     {!unfinished || active ? (
                        <div className={classNames(progress >= total ? "text-dimmed" : null)}>
                           {formatNumber(progress)}/{formatNumber(total)}
                        </div>
                     ) : null}
                  </div>
               );
            })}
         </div>
         <div className="divider mx-10 my10"></div>
         <div className="row">
            <div className="f1"></div>
            <button
               className="btn"
               onClick={() => {
                  playClick();
                  hideModal();
                  G.save.state.flags = clearFlag(G.save.state.flags, GameStateFlags.ShowTutorial);
                  GameStateUpdated.emit();
               }}
            >
               {t(L.HideTutorial)}
            </button>
         </div>
      </div>
   );
}
