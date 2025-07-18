import { ScrollArea, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { Catalyst, CatalystCat } from "@spaceship-idle/shared/src/game/definitions/Catalyst";
import { CatalystPerCat } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getEffect, getNextCatalystCat, getRequirement } from "@spaceship-idle/shared/src/game/logic/CatalystLogic";
import { classNames, keysOf, shuffle } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useCallback, useEffect, useRef } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import styles from "./CatalystFullScreen.module.css";
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
                              <Tooltip label={<RenderHTML html={t(L.SelectCatalystTooltipHTML)} />}>
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
                           </div>
                           <div className="f1" style={{ width: 400 }}>
                              <div className="m10">
                                 <div className="text-lg">{getRequirement(def)}</div>
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
                                             <TextureComp
                                                key={b}
                                                style={{ flexShrink: 0 }}
                                                name={`Building/${b}`}
                                                width={Math.min(G.pixi.screen.height / 10, 100)}
                                             />
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
