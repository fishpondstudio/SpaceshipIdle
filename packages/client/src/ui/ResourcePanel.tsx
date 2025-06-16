import { ScrollArea } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Resource } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { resourceDiffOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { classNames, formatNumber, hasFlag, mMapOf, mathSign } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "../utils/Global";
import { ResourceAmount } from "./components/ResourceAmountComp";

export function ResourcePanel(): React.ReactNode {
   const state = G.runtime.left;
   const options = G.save.options;
   if (!hasFlag(options.flag, GameOptionFlag.ShowResources)) return null;
   return (
      <ScrollArea.Autosize scrollbars="y" offsetScrollbars="y" className="resource-panel">
         {mMapOf(state.resources, (res, amount) => {
            const name = Config.Resources[res].name();
            const diff = resourceDiffOf(
               res,
               hasFlag(options.flag, GameOptionFlag.TheoreticalValue),
               G.runtime.leftStat,
            );
            if (res === "Power" || res === "XP" || res === "Warp") return null;
            return (
               <div key={res} className="row g10" style={{ color: `#${getResourceColor(res).toString(16)}` }}>
                  <div>{name}</div>
                  <div>
                     <ResourceAmount res={res} amount={amount} />
                  </div>
                  <div className={classNames(diff >= 0 ? "text-green" : "text-red")}>
                     {mathSign(diff)}
                     {formatNumber(Math.abs(diff))}
                  </div>
               </div>
            );
         })}
      </ScrollArea.Autosize>
   );
}

function getResourceColor(res: Resource): number {
   const building = Config.ResourceToBuilding.get(res);
   if (building) {
      return G.save.options.buildingColors.get(building) ?? 0xffffff;
   }
   return 0xffffff;
}
