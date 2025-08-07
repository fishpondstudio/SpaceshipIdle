import { ScrollArea, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { Catalyst, CatalystCat } from "@spaceship-idle/shared/src/game/definitions/Catalyst";
import { CatalystPerCat } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import {
   canChooseCatalystCat,
   getEffect,
   getNextCatalystCat,
   getRequirement,
} from "@spaceship-idle/shared/src/game/logic/CatalystLogic";
import { classNames, keysOf, shuffle } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useCallback, useEffect, useRef } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import styles from "./CatalystFullScreen.module.css";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError } from "./Sound";

export function CatalystFullScreen(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   const viewportRef = useRef<HTMLDivElement | null>(null);

   const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
      if (!viewportRef.current || e.deltaY === 0 || e.deltaX !== 0) {
         return;
      }
      e.preventDefault();
      e.stopPropagation();

      viewportRef.current.scrollBy({
         left: e.deltaY * 2,
         behavior: "smooth",
      });
   }, []);

   useEffect(() => {
      viewportRef.current?.addEventListener("wheel", (e: WheelEvent) => {
         onWheel(e as unknown as React.WheelEvent<HTMLDivElement>);
      });
   }, [onWheel]);
   return (
      <ScrollArea
         viewportRef={viewportRef}
         classNames={{
            root: styles.container,
            content: styles.content,
         }}
         type="never"
      >
         <div style={{ flex: "0 0 320px" }}></div>
         {Array.from(G.save.current.catalysts).map(([cat, data], idx) => {
            return (
               <div
                  key={cat}
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     gap: 20,
                  }}
               >
                  <div className={styles.title}>{CatalystCat[cat].name()}</div>
                  {data.choices.map((choice) => {
                     const def = Catalyst[choice];
                     let status: React.ReactNode = null;
                     if (data.selected === choice) {
                        if (G.runtime.leftStat.isCatalystActivated(choice)) {
                           status = (
                              <Tooltip label={t(L.CatalystActivated)}>
                                 <div className="mi text-green">check_circle</div>
                              </Tooltip>
                           );
                        } else {
                           status = (
                              <Tooltip label={t(L.CatalystNotActivated)}>
                                 <div className="mi text-red">do_not_disturb_on</div>
                              </Tooltip>
                           );
                        }
                     }
                     return (
                        <div
                           key={choice}
                           className={classNames(styles.box, "f1 row g0")}
                           style={{ opacity: data.selected && data.selected !== choice ? 0.25 : 1 }}
                        >
                           <div
                              className="cc"
                              style={{
                                 width: 50,
                                 borderRight: "2px dotted rgba(255, 255, 255, 0.25)",
                                 alignSelf: "stretch",
                              }}
                           >
                              {canChooseCatalystCat(cat, G.runtime) ? (
                                 <Tooltip
                                    multiline
                                    maw="30vw"
                                    label={<RenderHTML html={t(L.SelectCatalystTooltipHTML)} />}
                                 >
                                    <div
                                       className="mi lg pointer"
                                       onClick={() => {
                                          if (data.selected) {
                                             playError();
                                             return;
                                          }
                                          playClick();
                                          data.selected = choice;
                                          const next = getNextCatalystCat(cat);
                                          if (next) {
                                             G.save.current.catalysts.set(next, {
                                                choices: shuffle(CatalystCat[next].candidates.slice(0)).slice(
                                                   0,
                                                   CatalystPerCat,
                                                ),
                                                selected: null,
                                             });
                                          }
                                          GameStateUpdated.emit();
                                       }}
                                    >
                                       {data.selected === choice ? "check_box" : "check_box_outline_blank"}
                                    </div>
                                 </Tooltip>
                              ) : (
                                 <Tooltip label={t(L.YouHaveToActivateThePreviousCatalystFirst)}>
                                    <div className="mi">lock</div>
                                 </Tooltip>
                              )}
                           </div>
                           <div className="f1" style={{ width: 400 }}>
                              <div className="m10">
                                 <div className="row">
                                    <div className="text-lg">{getRequirement(def)}</div>
                                    {status}
                                    <div className="f1" />
                                 </div>
                                 <div className="text-sm text-dimmed">{getEffect(def)}</div>
                              </div>
                              <div className="f1">
                                 <ScrollArea
                                    w={400}
                                    scrollbars="x"
                                    offsetScrollbars="x"
                                    type="auto"
                                    styles={{ content: { display: "flex" } }}
                                 >
                                    {keysOf(Config.Buildings)
                                       .filter(def.filter)
                                       .map((b) => {
                                          return (
                                             <Tooltip
                                                multiline
                                                color="gray"
                                                label={
                                                   <div style={{ width: 330 }}>
                                                      <div className="row g5 mb5">
                                                         <TextureComp name={`Building/${b}`} />
                                                         <div className="text-lg">{getBuildingName(b)}</div>
                                                      </div>
                                                      <BuildingInfoComp building={b} />
                                                   </div>
                                                }
                                                key={b}
                                             >
                                                <TextureComp
                                                   style={{ flexShrink: 0 }}
                                                   name={`Building/${b}`}
                                                   width={Math.min(G.pixi.screen.height / 10, 100)}
                                                />
                                             </Tooltip>
                                          );
                                       })}
                                 </ScrollArea>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            );
         })}
      </ScrollArea>
   );
}
