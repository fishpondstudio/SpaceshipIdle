import type { ValueOf } from "../../utils/Helper";

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
   actions: PlanetAction[];
   flags: PlanetFlags;
}

export const PlanetFlags = {
   None: 0,
   AutoRenew: 1 << 0,
} as const;

export type PlanetFlags = ValueOf<typeof PlanetFlags>;

export const PlanetActionType = {
   Revealed: 1,
   DeclaredFriendship: 2,
   DeclaredWar: 3,
   WonWar: 4,
   LostWar: 5,
};

export type PlanetActionType = ValueOf<typeof PlanetActionType>;

export interface PlanetAction {
   type: PlanetActionType;
   tick: number;
}

export const PlanetType = {
   Me: 0,
   Pirate: 1,
   State: 2,
} as const;

export type PlanetType = ValueOf<typeof PlanetType>;
