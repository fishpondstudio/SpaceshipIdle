import type { Resource } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { memo } from "react";

function _ResourceAmount({ res, amount }: { res: Resource; amount: number }): React.ReactNode {
   if (res === "Power") {
      return `${formatNumber(amount, true)}W`;
   }
   return formatNumber(amount);
}

export const ResourceAmount = memo(_ResourceAmount);
