import { Progress } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { ElementPermanentColor } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import {
   canUpgradeElement,
   getElementUpgradeCost,
   tryUpgradeElement,
} from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import {
   GroupBlockLabel,
   PeriodicTable,
   StandardStateLabel,
   type ElementSymbol,
} from "@spaceship-idle/shared/src/game/PeriodicTable";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ElementImageComp } from "../game/ElementImage";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { playClick } from "./Sound";

export function ElementModal({ symbol }: { symbol: ElementSymbol }): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const element = PeriodicTable[symbol];
   const b = Config.Element.get(symbol);
   const thisRun = G.save.current.elements.get(symbol);
   const permanent = G.save.current.permanentElements.get(symbol);
   if (!element || !b) {
      return null;
   }
   return (
      <div className="m15">
         <div className="row">
            <div>
               <ElementImageComp symbol={element.symbol} w="100" color={ElementPermanentColor} />
            </div>
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
         <div className="h5" />
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
                  <div className="f1">{t(L.LevelX, permanent.level)}</div>
                  <div className="text-dimmed">
                     {t(L.PlusXProductionMultiplierForX, permanent.level, Config.Buildings[b].name())}
                  </div>
               </div>
               <div className="divider dashed mx-15 my10"></div>
               <div className="row">
                  <div className="f1">
                     <div className="row">
                        <div className="f1">{t(L.Shards)}</div>
                        <div>
                           {permanent.amount}/{getElementUpgradeCost(permanent.level + 1)}
                        </div>
                     </div>
                     <Progress
                        className="f1"
                        value={(100 * permanent.amount) / getElementUpgradeCost(permanent.level + 1)}
                     />
                  </div>
                  <button
                     className="btn py5 px10 filled"
                     onClick={() => {
                        playClick();
                        if (tryUpgradeElement(symbol, G.save.current)) {
                           GameOptionUpdated.emit();
                        }
                     }}
                     disabled={!canUpgradeElement(symbol, G.save.current)}
                  >
                     {t(L.Upgrade)}
                  </button>
               </div>
            </>
         ) : null}
      </div>
   );
}
