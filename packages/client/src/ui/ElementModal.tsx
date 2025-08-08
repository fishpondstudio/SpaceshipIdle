import { Progress, Tooltip } from "@mantine/core";
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
import { classNames, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ElementImageComp } from "../game/ElementImage";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError } from "./Sound";

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
               <div>{getBuildingName(b)}</div>
            </Tooltip>
         </div>
         {thisRun ? (
            <>
               <div className="divider my10 mx-15" />
               <div className="title mx0">
                  <div>{t(L.ElementThisRun)}</div>
                  <div className="f1" />
                  <div className={classNames(thisRun.amount > 0 ? "text-red" : null)}>
                     {t(L.Unassigned, formatNumber(thisRun.amount))}
                  </div>
               </div>
               <div className="divider my10 mx-15" />
               <div className="row">
                  <div className="f1">{t(L.HPMultiplier)}</div>
                  <div
                     className={classNames("mi", thisRun.amount <= 0 ? "text-disabled" : null)}
                     onClick={() => {
                        if (thisRun.amount > 0) {
                           playClick();
                           --thisRun.amount;
                           ++thisRun.hp;
                           GameStateUpdated.emit();
                        } else {
                           playError();
                        }
                     }}
                  >
                     add_box
                  </div>
                  <div className="text-center text-mono">{formatNumber(thisRun.hp)}</div>
                  <div
                     className={classNames("mi", thisRun.hp <= 0 ? "text-disabled" : null)}
                     onClick={() => {
                        if (thisRun.hp > 0) {
                           playClick();
                           --thisRun.hp;
                           ++thisRun.amount;
                           GameStateUpdated.emit();
                        } else {
                           playError();
                        }
                     }}
                  >
                     indeterminate_check_box
                  </div>
               </div>
               <div className="row">
                  <div className="f1">{t(L.DamageMultiplier)}</div>
                  <div
                     className={classNames("mi", thisRun.amount <= 0 ? "text-disabled" : null)}
                     onClick={() => {
                        if (thisRun.amount > 0) {
                           playClick();
                           --thisRun.amount;
                           ++thisRun.damage;
                           GameStateUpdated.emit();
                        } else {
                           playError();
                        }
                     }}
                  >
                     add_box
                  </div>
                  <div className="text-center text-mono">{formatNumber(thisRun.damage)}</div>
                  <div
                     className={classNames("mi", thisRun.damage <= 0 ? "text-disabled" : null)}
                     onClick={() => {
                        if (thisRun.damage > 0) {
                           playClick();
                           --thisRun.damage;
                           ++thisRun.amount;
                           GameStateUpdated.emit();
                        } else {
                           playError();
                        }
                     }}
                  >
                     indeterminate_check_box
                  </div>
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
                  <Tooltip label={t(L.PlusXProductionMultiplierForX, permanent.hp, getBuildingName(b))}>
                     <div className="mi sm text-dimmed">info</div>
                  </Tooltip>
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
                        if (tryUpgradeElement(symbol, "hp", G.save.current)) {
                           GameStateUpdated.emit();
                        }
                     }}
                     disabled={!canUpgradeElement(symbol, "hp", G.save.current)}
                  >
                     {t(L.Upgrade)}
                  </button>
                  <Tooltip label={<RenderHTML html={t(L.RevertTooltipHTML)} />}>
                     <button
                        disabled={permanent.hp <= 0}
                        className="btn py5 px10"
                        onClick={() => {
                           playClick();
                           revertElementUpgrade(symbol, "hp", G.save.current);
                           GameStateUpdated.emit();
                        }}
                     >
                        {t(L.Revert)}
                     </button>
                  </Tooltip>
               </div>
               <div className="divider dashed mx-15 my10"></div>
               <div className="row g5">
                  <div className="f1">{t(L.DamageMultiplier)}</div>
                  <Tooltip label={t(L.PlusXXPMultiplierForX, permanent.damage, getBuildingName(b))}>
                     <div className="mi sm text-dimmed">info</div>
                  </Tooltip>
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
                        if (tryUpgradeElement(symbol, "damage", G.save.current)) {
                           GameStateUpdated.emit();
                        }
                     }}
                     disabled={!canUpgradeElement(symbol, "damage", G.save.current)}
                  >
                     {t(L.Upgrade)}
                  </button>
                  <Tooltip label={<RenderHTML html={t(L.RevertTooltipHTML)} />}>
                     <button
                        disabled={permanent.damage <= 0}
                        className="btn py5 px10"
                        onClick={() => {
                           playClick();
                           revertElementUpgrade(symbol, "damage", G.save.current);
                           GameStateUpdated.emit();
                        }}
                     >
                        {t(L.Revert)}
                     </button>
                  </Tooltip>
               </div>
            </>
         ) : null}
      </div>
   );
}
