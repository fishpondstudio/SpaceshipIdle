import type { ValueOf } from "../../utils/Helper";

export interface Galaxy {
   solarSystems: SolarSystem[];
}

export interface SolarSystem {
   id: number;
   x: number;
   y: number;
   r: number;
   discovered: boolean;
   distance: number;
   planets: Planet[];
}

export interface Planet {
   id: number;
   r: number;
   radian: number;
   speed: number;
   type: PlanetType;
}

export const PlanetType = {
   Me: 0,
   Pirate: 1,
   Country: 2,
} as const;

export type PlanetType = ValueOf<typeof PlanetType>;
