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
import { hideModal } from "../utils/ToggleModal";
import { playClick } from "./Sound";

export function ElementModal({ symbol }: { symbol: ElementSymbol }): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const element = PeriodicTable[symbol];
   const b = Config.Element.get(symbol);
   const inventory = G.save.options.elements.get(symbol);
   if (!element || !b || !inventory) {
      return null;
   }
   return (
      <div className="row m15 gap20">
         <div style={{ alignSelf: "flex-start" }}>
            <ElementImageComp symbol={element.symbol} w="200" color={ElementPermanentColor} />
         </div>
         <div className="f1">
            <div className="row">
               <div className="f1">{t(L.Element)}</div>
               <div>
                  {element.name} ({element.symbol})
               </div>
            </div>
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
            <div className="divider my10" />
            <div className="row">
               <div className="f1">{t(L.Level)}</div>
               <div>{inventory.level}</div>
            </div>
            <div className="text-right text-sm text-dimmed">
               {t(L.PlusXPMultiplier, inventory.level, Config.Buildings[b].name())}
            </div>
            <div className="row">
               <div className="f1">{t(L.Shards)}</div>
               <div>
                  {inventory.amount}/{getElementUpgradeCost(inventory.level + 1)}
               </div>
            </div>
            <Progress className="my10" value={(100 * inventory.amount) / getElementUpgradeCost(inventory.level + 1)} />
            <div className="h5" />
            <div className="row">
               <div className="f1" />
               <button
                  className="btn py5 px10 filled"
                  onClick={() => {
                     playClick();
                     if (tryUpgradeElement(symbol, G.save.options)) {
                        GameOptionUpdated.emit();
                     }
                  }}
                  disabled={!canUpgradeElement(symbol, G.save.options)}
               >
                  {t(L.Upgrade)}
               </button>
               <button className="btn py5 px10" onClick={() => hideModal()}>
                  {t(L.Close)}
               </button>
            </div>
         </div>
      </div>
   );
}
