import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { Addon } from "./Addons";
import type { Boost } from "./Boosts";
import type { Resource } from "./Resource";

export interface Galaxy {
   starSystems: StarSystem[];
}

interface GalaxyEntity {
   id: number;
   name: string;
   texture: string;
   r: number;
}

export interface StarSystem extends GalaxyEntity {
   x: number;
   y: number;
   discovered: boolean;
   distance: number;
   planets: Planet[];
}

export interface Planet extends GalaxyEntity {
   radian: number;
   speed: number;
   type: PlanetType;
   flags: PlanetFlags;
   seed: string;
   battleResult: BattleResult | null;
   friendshipTimeLeft: number;
   friendshipBoost: Boost;
   revealed: boolean;
}

export const PlanetFlags = {
   None: 0,
   AutoRenewFriendship: 1 << 0,
   WasFriends: 1 << 1,
} as const;

export type PlanetFlags = ValueOf<typeof PlanetFlags>;

export const PlanetType = {
   Me: 0,
   Pirate: 1,
   State: 2,
} as const;

export type PlanetType = ValueOf<typeof PlanetType>;

export const PlanetTypeLabel = {
   [PlanetType.Me]: () => t(L.You),
   [PlanetType.Pirate]: () => t(L.Pirate),
   [PlanetType.State]: () => t(L.NeutralState),
} as const satisfies Record<PlanetType, () => string>;

export interface BattleResult {
   battleScore: number;
   addons: Map<Addon, number>;
   resources: Map<Resource, number>;
}
