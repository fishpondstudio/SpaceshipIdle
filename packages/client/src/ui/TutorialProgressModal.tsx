import { Tooltip } from "@mantine/core";
import { classNames, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { Tutorial } from "../game/Tutorial";
import { G } from "../utils/Global";
import { RenderHTML } from "./components/RenderHTMLComp";

export function TutorialProgressModal(): React.ReactNode {
   let unfinished = false;
   return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
         {Tutorial.map((step, i) => {
            const [progress, total] = step.progress(G.save.current);
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
                     <Tooltip
                        label={step.desc ? <RenderHTML html={step.desc()} /> : null}
                        disabled={!step.desc}
                        multiline
                        maw="30vw"
                     >
                        <div className={classNames(active ? "text-space" : null)}>{step.name()}</div>
                     </Tooltip>
                     {active ? (
                        <div className="text-sm text-dimmed">
                           {step.desc ? <RenderHTML html={step.desc()} /> : null}
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
   );
}
