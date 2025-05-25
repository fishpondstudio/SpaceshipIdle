import { Box } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Resource } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { canSpend } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { classNames, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import type React from "react";
import { G } from "../../utils/Global";
import { ResourceAmount } from "./ResourceAmountComp";

export function ResourceListComp({
   res,
   showColor = true,
}: { res: Map<Resource, number>; showColor?: boolean }): React.ReactNode {
   return (
      <Box>
         {mMapOf(res, (res, amount) => {
            const color = canSpend(new Map([[res, amount]]), G.save.current) ? "text-green" : "text-red";
            return (
               <div className="row" key={res}>
                  <div className="f1">{Config.Resources[res].name()}</div>
                  <div className={classNames(showColor ? color : null)}>
                     <ResourceAmount res={res} amount={amount} />
                  </div>
               </div>
            );
         })}
      </Box>
   );
}
