import type { Resource } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";

export function ResourceAmount({ res, amount }: { res: Resource; amount: number }): string {
   return formatNumber(amount);
}
