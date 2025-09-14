import { GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { clearFlag, cls, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { Tutorial } from "../game/Tutorial";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { FloatingTip } from "./components/FloatingTip";
import { html, RenderHTML } from "./components/RenderHTMLComp";
import { playClick } from "./Sound";

export function TutorialProgressModal(): React.ReactNode {
   let unfinished = false;
   return (
      <div className="m10">
         <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Tutorial.map((step, i) => {
               const [progress, total] = step.progress(G.save.state, G.runtime);
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
                        <FloatingTip label={<RenderHTML html={step.desc()} />}>
                           <div className={cls(active ? "text-space" : null)}>{step.name()}</div>
                        </FloatingTip>
                        {active ? html(step.desc(), "text-sm text-dimmed") : null}
                     </div>
                     {!unfinished || active ? (
                        <div className={cls(progress >= total ? "text-dimmed" : null)}>
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
               {t(L.SkipTutorial)}
            </button>
         </div>
      </div>
   );
}
