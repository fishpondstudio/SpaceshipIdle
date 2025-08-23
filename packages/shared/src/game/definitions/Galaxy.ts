import type { ValueOf } from "../../utils/Helper";

export interface Galaxy {
   solarSystems: StarSystem[];
}

export interface StarSystem {
   id: number;
   name: string;
   x: number;
   y: number;
   r: number;
   discovered: boolean;
   distance: number;
   planets: Planet[];
}

export interface Planet {
   id: number;
   name: string;
   r: number;
   radian: number;
   speed: number;
   type: PlanetType;
   actions: PlanetAction[];
}

export const PlanetAction = {
   Revealed: 1,
   DeclaredFriendship: 2,
   DeclaredWar: 3,
   WonWar: 4,
   LostWar: 5,
};

export type PlanetAction = ValueOf<typeof PlanetAction>;

export const PlanetType = {
   Me: 0,
   Pirate: 1,
   State: 2,
} as const;

export type PlanetType = ValueOf<typeof PlanetType>;
