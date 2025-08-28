import { Progress } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { ElementPermanentColor } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
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
import { cls, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ElementImageComp } from "../game/ElementImage";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { FloatingTip } from "./components/FloatingTip";
import { NumberSelect } from "./components/NumberInput";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function ElementModal({ symbol }: { symbol: ElementSymbol }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const element = PeriodicTable[symbol];
   const b = Config.Elements[symbol];
   const thisRun = G.save.state.elements.get(symbol);
   const permanent = G.save.state.permanentElements.get(symbol);
   if (!element || !b) {
      return null;
   }
   return (
      <div className="m15">
         <div className="row">
            <ElementImageComp symbol={element.symbol} w="100" color={ElementPermanentColor} />
            <TextureComp name={`Building/${b}`} width={32 * 3} />
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
            <FloatingTip w={350} label={<BuildingInfoComp building={b} />}>
               <div>{getBuildingName(b)}</div>
            </FloatingTip>
         </div>
         {thisRun ? (
            <>
               <div className="divider my10 mx-15" />
               <div className="title mx0">
                  <div>{t(L.ElementThisRun)}</div>
                  <div className="f1" />
                  <div className={cls(thisRun.amount > 0 ? "text-red" : null)}>
                     {t(L.XUnassigned, formatNumber(thisRun.amount))}
                  </div>
               </div>
               <div className="divider my10 mx-15" />
               <div className="row">
                  <div className="f1">{t(L.HPMultiplier)}</div>
                  <NumberSelect
                     value={thisRun.hp}
                     canIncrease={(value) => thisRun.amount > 0}
                     canDecrease={(value) => value > 0}
                     onChange={(value) => {
                        const delta = value - thisRun.hp;
                        thisRun.hp = value;
                        thisRun.amount -= delta;
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
               <div className="row">
                  <div className="f1">{t(L.DamageMultiplier)}</div>
                  <NumberSelect
                     value={thisRun.damage}
                     canIncrease={(value) => thisRun.amount > 0}
                     canDecrease={(value) => value > 0}
                     onChange={(value) => {
                        const delta = value - thisRun.damage;
                        thisRun.damage = value;
                        thisRun.amount -= delta;
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
            </>
         ) : null}
         {permanent ? (
            <>
               <div className="divider my10 mx-15" />
               <div className="title mx0">
                  <div className="f1">{t(L.PermanentElement)}</div>
                  <div>{t(L.XShards, formatNumber(permanent.amount))}</div>
               </div>
               <div className="divider my10 mx-15" />
               <div className="row g5">
                  <div className="f1">{t(L.HPMultiplier)}</div>
                  <FloatingTip label={t(L.PlusXProductionMultiplierForX, permanent.hp, getBuildingName(b))}>
                     <div className="mi sm text-dimmed">info</div>
                  </FloatingTip>
                  <div>{t(L.LevelX, permanent.hp)}</div>
               </div>
               <div className="h5" />
               <div className="row">
                  <div className="f1">
                     <div className="row">
                        <div className="f1 text-dimmed">{t(L.RequiredShards)}</div>
                        <div>
                           {permanent.amount}/{getElementUpgradeCost(permanent.hp + 1)}
                        </div>
                     </div>
                     <Progress
                        className="f1"
                        value={(100 * permanent.amount) / getElementUpgradeCost(permanent.hp + 1)}
                     />
                  </div>
                  <button
                     className="btn py5 px10 filled"
                     onClick={() => {
                        playClick();
                        if (tryUpgradeElement(symbol, "hp", G.save.state)) {
                           GameStateUpdated.emit();
                        }
                     }}
                     disabled={!canUpgradeElement(symbol, "hp", G.save.state)}
                  >
                     {t(L.Upgrade)}
                  </button>
                  <FloatingTip label={<RenderHTML html={t(L.RevertTooltipHTML)} />}>
                     <button
                        disabled={permanent.hp <= 0}
                        className="btn py5 px10"
                        onClick={() => {
                           playClick();
                           revertElementUpgrade(symbol, "hp", G.save.state);
                           GameStateUpdated.emit();
                        }}
                     >
                        {t(L.Revert)}
                     </button>
                  </FloatingTip>
               </div>
               <div className="divider dashed mx-15 my10"></div>
               <div className="row g5">
                  <div className="f1">{t(L.DamageMultiplier)}</div>
                  <FloatingTip label={t(L.PlusXXPMultiplierForX, permanent.damage, getBuildingName(b))}>
                     <div className="mi sm text-dimmed">info</div>
                  </FloatingTip>
                  <div>{t(L.LevelX, permanent.damage)}</div>
               </div>
               <div className="h5" />
               <div className="row">
                  <div className="f1">
                     <div className="row">
                        <div className="f1 text-dimmed">{t(L.RequiredShards)}</div>
                        <div>
                           {permanent.amount}/{getElementUpgradeCost(permanent.damage + 1)}
                        </div>
                     </div>
                     <Progress
                        className="f1"
                        value={(100 * permanent.amount) / getElementUpgradeCost(permanent.damage + 1)}
                     />
                  </div>
                  <button
                     className="btn py5 px10 filled"
                     onClick={() => {
                        playClick();
                        if (tryUpgradeElement(symbol, "damage", G.save.state)) {
                           GameStateUpdated.emit();
                        }
                     }}
                     disabled={!canUpgradeElement(symbol, "damage", G.save.state)}
                  >
                     {t(L.Upgrade)}
                  </button>
                  <FloatingTip label={<RenderHTML html={t(L.RevertTooltipHTML)} />}>
                     <button
                        disabled={permanent.damage <= 0}
                        className="btn py5 px10"
                        onClick={() => {
                           playClick();
                           revertElementUpgrade(symbol, "damage", G.save.state);
                           GameStateUpdated.emit();
                        }}
                     >
                        {t(L.Revert)}
                     </button>
                  </FloatingTip>
               </div>
            </>
         ) : null}
      </div>
   );
}
