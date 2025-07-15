import { Progress, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { ElementPermanentColor } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   canUpgradeElement,
   getElementUpgradeCost,
   revertElementUpgrade,
   tryUpgradeElement,
} from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import {
   type ElementSymbol,
   GroupBlockLabel,
   PeriodicTable,
   StandardStateLabel,
} from "@spaceship-idle/shared/src/game/PeriodicTable";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ElementImageComp } from "../game/ElementImage";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { XPIcon } from "./components/SVGIcons";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function ElementModal({ symbol }: { symbol: ElementSymbol }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const element = PeriodicTable[symbol];
   const b = Config.Elements[symbol];
   const thisRun = G.save.current.elements.get(symbol);
   const permanent = G.save.current.permanentElements.get(symbol);
   if (!element || !b) {
      return null;
   }
   return (
      <div className="m15">
         <div className="row">
            <ElementImageComp symbol={element.symbol} w="100" color={ElementPermanentColor} />
            <TextureComp name={`Building/${b}`} width={100} />
            <div className="f1">
               <div className="row">
                  <div className="f1">{t(L.AtomicNumber)}</div>
                  <div>{element.atomicNumber}</div>
               </div>
               <div className="row">
                  <div className="f1">{t(L.AtomicMass)}</div>
                  <div>{element.atomicMass}</div>
               </div>
               <div className="row">
                  <div className="f1">{t(L.StandardState)}</div>
                  <div>{StandardStateLabel[element.standardState]()}</div>
               </div>
               <div className="row">
                  <div className="f1">{t(L.Category)}</div>
                  <div>{GroupBlockLabel[element.groupBlock]()}</div>
               </div>
            </div>
         </div>
         <div className="divider my10 mx-15" />
         <div className="row">
            <div className="f1">{t(L.BoostModule)}</div>
            <Tooltip multiline color="gray" label={<BuildingInfoComp building={b} />}>
               <div>{Config.Buildings[b].name()}</div>
            </Tooltip>
         </div>
         {thisRun ? (
            <>
               <div className="divider my10 mx-15" />
               <div className="title mx0">{t(L.ElementThisRun)}</div>
               <div className="divider my10 mx-15" />
               <div className="row">
                  <div className="f1">{thisRun}x</div>
                  <div className="text-dimmed">
                     {t(L.PlusXProductionMultiplierForX, thisRun, Config.Buildings[b].name())}
                  </div>
               </div>
            </>
         ) : null}
         {permanent ? (
            <>
               <div className="divider my10 mx-15" />
               <div className="title mx0">{t(L.PermanentElement)}</div>
               <div className="divider my10 mx-15" />
               <div className="row">
                  <div className="f1">{t(L.Shards)}</div>
                  <div>{permanent.amount}</div>
               </div>
               <div className="divider dashed mx-15 my10"></div>
               <div className="row g5">
                  <div className="mi">handyman</div>
                  <div className="f1">{t(L.ProductionMultiplier)}</div>
                  <Tooltip label={t(L.PlusXProductionMultiplierForX, permanent.production, Config.Buildings[b].name())}>
                     <div className="mi sm text-dimmed">info</div>
                  </Tooltip>
                  <div>{t(L.LevelX, permanent.production)}</div>
               </div>
               <div className="h5" />
               <div className="row">
                  <div className="f1">
                     <div className="row">
                        <div className="f1 text-dimmed">{t(L.RequiredShards)}</div>
                        <div>
                           {permanent.amount}/{getElementUpgradeCost(permanent.production + 1)}
                        </div>
                     </div>
                     <Progress
                        className="f1"
                        value={(100 * permanent.amount) / getElementUpgradeCost(permanent.production + 1)}
                     />
                  </div>
                  <button
                     className="btn py5 px10 filled"
                     onClick={() => {
                        playClick();
                        if (tryUpgradeElement(symbol, "production", G.save.current)) {
                           GameStateUpdated.emit();
                        }
                     }}
                     disabled={!canUpgradeElement(symbol, "production", G.save.current)}
                  >
                     {t(L.Upgrade)}
                  </button>
                  <Tooltip label={<RenderHTML html={t(L.RevertTooltipHTML)} />}>
                     <button
                        disabled={permanent.production <= 0}
                        className="btn py5 px10"
                        onClick={() => {
                           playClick();
                           revertElementUpgrade(symbol, "production", G.save.current);
                           GameStateUpdated.emit();
                        }}
                     >
                        {t(L.Revert)}
                     </button>
                  </Tooltip>
               </div>
               {WeaponKey in Config.Buildings[b] ? (
                  <>
                     <div className="divider dashed mx-15 my10"></div>
                     <div className="row g5">
                        <XPIcon />
                        <div className="f1">{t(L.XPMultiplier)}</div>
                        <Tooltip label={t(L.PlusXXPMultiplierForX, permanent.xp, Config.Buildings[b].name())}>
                           <div className="mi sm text-dimmed">info</div>
                        </Tooltip>
                        <div>{t(L.LevelX, permanent.xp)}</div>
                     </div>
                     <div className="h5" />
                     <div className="row">
                        <div className="f1">
                           <div className="row">
                              <div className="f1 text-dimmed">{t(L.RequiredShards)}</div>
                              <div>
                                 {permanent.amount}/{getElementUpgradeCost(permanent.xp + 1)}
                              </div>
                           </div>
                           <Progress
                              className="f1"
                              value={(100 * permanent.amount) / getElementUpgradeCost(permanent.xp + 1)}
                           />
                        </div>
                        <button
                           className="btn py5 px10 filled"
                           onClick={() => {
                              playClick();
                              if (tryUpgradeElement(symbol, "xp", G.save.current)) {
                                 GameStateUpdated.emit();
                              }
                           }}
                           disabled={!canUpgradeElement(symbol, "xp", G.save.current)}
                        >
                           {t(L.Upgrade)}
                        </button>
                        <Tooltip label={<RenderHTML html={t(L.RevertTooltipHTML)} />}>
                           <button
                              disabled={permanent.xp <= 0}
                              className="btn py5 px10"
                              onClick={() => {
                                 playClick();
                                 revertElementUpgrade(symbol, "xp", G.save.current);
                                 GameStateUpdated.emit();
                              }}
                           >
                              {t(L.Revert)}
                           </button>
                        </Tooltip>
                     </div>
                  </>
               ) : null}
            </>
         ) : null}
      </div>
   );
}
