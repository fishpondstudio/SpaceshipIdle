export interface Galaxy {
   solarSystems: SolarSystem[];
}

export interface SolarSystem {
   id: number;
   x: number;
   y: number;
   r: number;
   discovered: boolean;
   planets: Planet[];
}

export interface Planet {
   id: number;
   r: number;
   radian: number;
   speed: number;
}
