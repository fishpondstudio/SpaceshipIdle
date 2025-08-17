export interface Galaxy {
   solarSystems: SolarSystem[];
}

export interface SolarSystem {
   x: number;
   y: number;
   r: number;
   planets: Planet[];
}

export interface Planet {
   id: number;
   r: number;
   radian: number;
   speed: number;
}
