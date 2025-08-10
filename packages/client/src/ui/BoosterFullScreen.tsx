import { ScrollArea, Tooltip } from "@mantine/core";
import { Boosters, getBoosterEffect } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { formatNumber, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React from "react";
import { G } from "../utils/Global";
import styles from "./BoosterFullScreen.module.css";
import { RenderHTML } from "./components/RenderHTMLComp";
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
         {mapOf(ShipClass, (k, v) => {
            return (
               <React.Fragment key={k}>
                  <div className={styles.title}>{t(L.XClass, v.name())}</div>
                  <div className={styles.container}>
                     {mapOf(Boosters, (booster) => {
                        const def = Boosters[booster];
                        const amount = G.save.current.boosters.get(booster)?.amount ?? 0;
                        const effect = getBoosterEffect(amount);
                        if (def.shipClass !== k) {
                           return null;
                        }
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
                                    <Tooltip multiline maw="25vw" label={<RenderHTML html={def.desc(effect)} />}>
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
               </React.Fragment>
            );
         })}
      </ScrollArea>
   );
}
