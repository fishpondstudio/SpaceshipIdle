import { ScrollArea, Tooltip } from "@mantine/core";
import { Boosters, getBoosterEffect } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { formatNumber, mapOf, range } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import styles from "./BoosterFullScreen.module.css";
import { TextureComp } from "./components/TextureComp";

export function BoosterFullScreen(): React.ReactNode {
   return (
      <ScrollArea
         className={styles.fullscreen}
         scrollbars="y"
         styles={{
            content: {
               padding: "5% 0 10% 0",
            },
         }}
      >
         <div className={styles.title}>{t(L.XClass, t(L.TechSkiff))}</div>
         <div className={styles.container}>
            {mapOf(Boosters, (booster) => {
               const def = Boosters[booster];
               const amount = G.save.current.boosters.get(booster) ?? 0;
               const effect = getBoosterEffect(amount);
               return (
                  <div key={booster} className={styles.item}>
                     <div>{def.name()}</div>
                     <TextureComp name={`Booster/${booster}`} width={50} />
                     <div className="f1" />
                     {amount > 0 ? (
                        <>
                           <div className="row text-sm text-dimmed stretch">
                              <div>{t(L.Amount)}</div>
                              <div className="f1" />
                              <div>{amount}</div>
                           </div>
                           <Tooltip label={def.desc(effect)}>
                              <div className="row text-sm text-dimmed stretch">
                                 <div>{t(L.Effect)}</div>
                                 <div className="f1" />
                                 <div>+{formatNumber(effect)}</div>
                              </div>
                           </Tooltip>
                        </>
                     ) : (
                        <>
                           <div className="mi">indeterminate_question_box</div>
                           <div className="row text-sm text-dimmed stretch g5">
                              <div>{t(L.NotDiscovered)}</div>
                           </div>
                        </>
                     )}
                  </div>
               );
            })}
         </div>
         <div className={styles.title}>Scout Class</div>
         <div className={styles.container}>
            {range(0, 6).map((i) => {
               return (
                  <div key={i} className={styles.item}>
                     <TextureComp name="Building/AC130" width={50} />
                     <div className={styles.count}>x{i}</div>
                  </div>
               );
            })}
         </div>
      </ScrollArea>
   );
}
