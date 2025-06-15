import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import type { AABB } from "@spaceship-idle/shared/src/utils/Vector2";

export const SetFloatingPanel = new TypedEvent<IFloatingPanel>();

export interface IFloatingPanel {
   rect: AABB;
   content: React.ReactNode;
}
