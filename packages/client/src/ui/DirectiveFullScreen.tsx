import { RingProgress, ScrollArea } from "@mantine/core";
import styles from "./DirectiveFullScreen.module.css";

export function DirectiveFullScreen(): React.ReactNode {
   return (
      <ScrollArea
         className={styles.fullscreen}
         scrollbars="y"
         styles={{
            content: {
               padding: "5% 0 10% 0",
               display: "flex",
               flexDirection: "column",
               gap: "10px",
            },
         }}
      >
         <div className={styles.title}>Directives</div>
         <div className="subtitle dotted uppercase my5">
            <div className="mi mr5">play_circle</div>
            Active
         </div>
         <DirectiveItem />
         <div className="subtitle dotted uppercase my5">
            <div className="mi mr5">do_not_disturb_on</div>Queued
         </div>
         <DirectiveItem />
         <DirectiveItem />
      </ScrollArea>
   );
}

function DirectiveItem(): React.ReactNode {
   return (
      <div className={styles.item}>
         <div className="row f1">
            <div>
               <div>
                  <div className="mi inline mr5 text-green">check_circle</div>
                  Equip 2 Boosters
               </div>
               <div>
                  <div className="mi inline mr5">bubble</div>All modules equipped with a booster get +1 HP Multiplier
               </div>
            </div>
            <div className="f1" />
            <div>02:23 left</div>
            <div>
               <RingProgress size={60} thickness={10} roundCaps sections={[{ value: 40, color: "green" }]} />
            </div>
            <div className="col stretch">
               <div className="mi">arrow_circle_up</div>
               <div className="f1" />
               <div className="mi">arrow_circle_down</div>
            </div>
         </div>
      </div>
   );
}
