import { TypedEvent } from "../../utils/TypedEvent";
import type { IHaveXY } from "../../utils/Vector2";
import type { Addon } from "../definitions/Addons";
import type { Resource } from "../definitions/Resource";

export const RequestParticle = new TypedEvent<
   { from: IHaveXY; resource: Resource; amount: number } | { from: IHaveXY; addon: Addon; amount: number }
>();
