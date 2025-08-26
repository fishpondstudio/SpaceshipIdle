import { getDefaultZIndex, type PaperProps, Progress, Tooltip, Transition } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { ElementPermanentColor, ElementThisRunColor } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type ElementChoice, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { getElementUpgradeCost } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { addElementShard, addElementThisRun } from "@spaceship-idle/shared/src/game/logic/PrestigeLogic";
import { type ElementSymbol, PeriodicTable } from "@spaceship-idle/shared/src/game/PeriodicTable";
import { removeFrom } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useEffect } from "react";
import { ElementImageComp } from "../game/ElementImage";
import { runFunc, sequence } from "../utils/actions/Actions";
import { CustomAction } from "../utils/actions/CustomAction";
import { Easing } from "../utils/actions/Easing";
import { G } from "../utils/Global";
import { hideModal, showModal } from "../utils/ToggleModal";
import "./ChooseElementModal.css";
import { playUpgrade } from "./Sound";

export function ChooseElementModal({
   choice,
   sound = true,
   permanent = false,
}: {
   choice: ElementChoice;
   sound?: boolean;
   permanent: boolean;
}): React.ReactNode {
   useEffect(() => {
      if (sound) {
         playUpgrade();
      }
   }, [sound]);
   console.log(choice);
   return (
      <div className="m10">
         <div className="text-center text-xl">
            {permanent ? t(L.ChoosePermanentElementShards) : t(L.AnElementHasBeenDiscovered)}
         </div>
         <div className="h10" />
         <div className="row">
            {choice.choices.map((symbol, idx) => (
               <ElementOption
                  key={idx}
                  symbol={symbol}
                  permanent={permanent}
                  onClick={() => {
                     const choices = permanent ? G.save.data.permanentElementChoices : G.save.data.elementChoices;
                     const success = removeFrom(choices, choice);
                     if (success) {
                        if (permanent) {
                           addElementShard(G.save.state, symbol, 1);
                           GameOptionUpdated.emit();
                        } else {
                           addElementThisRun(G.save.state, symbol, 1);
                           GameStateUpdated.emit();
                        }
                     }
                     if (choices.length > 0) {
                        showModal({
                           children: <ChooseElementModal sound={false} choice={choices[0]} permanent={permanent} />,
                           size: "xl",
                        });
                     } else {
                        hideModal();
                     }
                  }}
               />
            ))}
         </div>
      </div>
   );
}

function ElementOption({
   symbol,
   permanent,
   onClick,
   ...props
}: { symbol: ElementSymbol; permanent: boolean; onClick: () => void } & PaperProps): React.ReactNode {
   const data = PeriodicTable[symbol];
   const b = Config.Elements[symbol];
   if (!data || !b) {
      return null;
   }
   const [opened, { open }] = useDisclosure(false);
   useEffect(() => open(), [open]);
   const currentHPMultiplier = G.save.state.permanentElements.get(symbol)?.hp ?? 0;
   const currentDamageMultiplier = G.save.state.permanentElements.get(symbol)?.damage ?? 0;
   const currentAmount = G.save.state.permanentElements.get(symbol)?.amount ?? 0;
   const thisRun = G.save.state.elements.get(symbol);
   return (
      <Transition mounted={opened} transition="pop" duration={1000} timingFunction="ease" keepMounted>
         {(transitionStyle) => (
            <div
               className="element-card sf-frame"
               {...props}
               style={transitionStyle}
               onClick={(e) => {
                  const img = (e.currentTarget as HTMLElement).querySelector("img");
                  if (img) {
                     const rect = img.getBoundingClientRect();
                     const clone = img.cloneNode(true) as HTMLImageElement;
                     clone.style.zIndex = String(getDefaultZIndex("modal") + 2);
                     clone.style.position = "fixed";
                     clone.style.left = `${rect.left}px`;
                     clone.style.top = `${rect.top}px`;
                     clone.style.width = `${rect.width}px`;
                     clone.style.height = `${rect.height}px`;
                     clone.style.backgroundColor = "var(--mantine-color-body)";
                     clone.style.pointerEvents = "none";
                     document.body.appendChild(clone);
                     sequence(
                        new CustomAction(
                           () => {
                              const rect = clone.getBoundingClientRect();
                              return { x: rect.x, y: rect.y, scale: 1 };
                           },
                           ({ x, y, scale }) => {
                              clone.style.left = `${x}px`;
                              clone.style.top = `${y}px`;
                              clone.style.transform = `scale(${scale})`;
                              clone.style.opacity = `${scale}`;
                           },
                           (initial, target, factor) => {
                              return {
                                 x: initial.x + (target.x - initial.x) * factor,
                                 y: initial.y + (target.y - initial.y) * factor,
                                 scale: initial.scale + (target.scale - initial.scale) * factor,
                              };
                           },
                           { x: window.innerWidth / 2 - rect.width / 2, y: window.innerHeight, scale: 0 },
                           0.5,
                           Easing.InCubic,
                        ),
                        runFunc(() => {
                           clone.remove();
                        }),
                     ).start();
                  }
                  onClick();
               }}
            >
               <ElementImageComp symbol={symbol} color={permanent ? ElementPermanentColor : ElementThisRunColor} />
               <div className="h10" />
               <div className="text-center">{t(L.HpOrDamageMultiplierForX, getBuildingName(b))}</div>
               <div className="h10" />
               <div className="divider mx-15 mb5" />
               {permanent ? null : (
                  <>
                     <Tooltip.Floating
                        color="gray"
                        multiline
                        w={300}
                        label={
                           <>
                              <div className="text-space">{t(L.ElementThisRun)}</div>
                              <div className="row">
                                 <div className="f1">{t(L.HPMultiplier)}</div>
                                 <div>{thisRun?.hp ?? 0}</div>
                              </div>
                              <div className="row">
                                 <div className="f1">{t(L.DamageMultiplier)}</div>
                                 <div>{thisRun?.damage ?? 0}</div>
                              </div>
                              <div className="row">
                                 <div className="f1">{t(L.Unassigned)}</div>
                                 <div>{thisRun?.amount ?? 0}</div>
                              </div>
                           </>
                        }
                     >
                        <div className="row">
                           <div className="f1">{t(L.ThisRun)}</div>
                           <div>
                              {thisRun?.hp ?? 0} + {thisRun?.damage ?? 0} ({thisRun?.amount ?? 0})
                           </div>
                        </div>
                     </Tooltip.Floating>
                     <div className="divider mx-15 my5" />
                  </>
               )}
               <Tooltip.Floating
                  color="gray"
                  multiline
                  w={300}
                  label={
                     <>
                        <div className="text-space">{t(L.PermanentElement)}</div>
                        <div className="row">
                           <div className="f1">{t(L.HPMultiplier)}</div>
                           <div>{currentHPMultiplier}</div>
                        </div>
                        <div className="row">
                           <div className="f1">{t(L.DamageMultiplier)}</div>
                           <div>{currentHPMultiplier}</div>
                        </div>
                     </>
                  }
               >
                  <div className="row">
                     <div className="f1">{t(L.Permanent)}</div>
                     <div>
                        {currentHPMultiplier} + {currentDamageMultiplier}
                     </div>
                  </div>
               </Tooltip.Floating>
               <div className="row">
                  <div className="f1">{t(L.Shards)}</div>
                  <div>
                     {currentAmount} / {getElementUpgradeCost(currentHPMultiplier + 1)}
                  </div>
               </div>
               <div className="h5" />
               <Progress value={(100 * currentAmount) / getElementUpgradeCost(currentHPMultiplier + 1)} />
            </div>
         )}
      </Transition>
   );
}
