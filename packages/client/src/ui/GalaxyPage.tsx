import { G } from "../utils/Global";
import { PlanetPage } from "./PlanetPage";
import { StarSystemPage } from "./StarSystemPage";

export function GalaxyPage({ id }: { id: number }): React.ReactNode {
   for (const starSystem of G.save.data.galaxy.starSystems) {
      if (starSystem.id === id) {
         return <StarSystemPage starSystem={starSystem} />;
      }
      for (const planet of starSystem.planets) {
         if (planet.id === id) {
            return <PlanetPage planet={planet} />;
         }
      }
   }
   return null;
}
