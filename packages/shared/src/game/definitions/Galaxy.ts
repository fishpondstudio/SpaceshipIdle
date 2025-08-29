import type { ValueOf } from "../../utils/Helper";
import type { Booster } from "./Boosters";
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

export interface BattleResult {
   battleScore: number;
   boosters: Map<Booster, number>;
   resources: Map<Resource, number>;
}
