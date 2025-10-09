import type { IAABB } from "@spaceship-idle/shared/src/utils/AABB";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";

export const SetPopover = new TypedEvent<IPopover | undefined>();

export interface IPopover {
   rect: IAABB;
   content: React.ReactNode;
}
