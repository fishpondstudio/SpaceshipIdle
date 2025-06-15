import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import type { AABB } from "@spaceship-idle/shared/src/utils/Vector2";

export const SetPopover = new TypedEvent<IPopover | undefined>();

export interface IPopover {
   rect: AABB;
   content: React.ReactNode;
}
