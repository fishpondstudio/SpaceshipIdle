import type { AABB } from "@spaceship-idle/shared/src/utils/AABB";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";

export const SetPopover = new TypedEvent<IPopover | undefined>();

export interface IPopover {
   rect: AABB;
   content: React.ReactNode;
}
