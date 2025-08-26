import { PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { G } from "../utils/Global";
import { GalaxyMePage } from "./GalaxyMePage";
import { PlanetPage } from "./PlanetPage";
import { StarSystemPage } from "./StarSystemPage";

export function GalaxyPage({ id }: { id: number }): React.ReactNode {
   for (const starSystem of G.save.data.galaxy.starSystems) {
      if (starSystem.id === id) {
         if (import.meta.env.DEV) {
            console.log(starSystem);
         }
         return <StarSystemPage starSystem={starSystem} />;
      }
      for (const planet of starSystem.planets) {
         if (planet.id === id) {
            if (import.meta.env.DEV) {
               console.log(planet);
            }
            switch (planet.type) {
               case PlanetType.Me:
                  return <GalaxyMePage planet={planet} />;
               default:
                  return <PlanetPage planet={planet} />;
            }
         }
      }
   }
   return null;
}
