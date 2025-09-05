import { PlanetTypeLabel, type StarSystem } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { getPlanetStatusLabel } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function StarSystemPage({ starSystem }: { starSystem: StarSystem }): React.ReactNode {
   return (
      <SidebarComp
         title={
            <div className="row">
               <TextureComp name={`Galaxy/${starSystem.texture}`} />
               <div className="f1">{starSystem.name} System</div>
            </div>
         }
      >
         <div className="h10" />
         <div className="title">Basic Info</div>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row">
               <div className="f1">Name</div>
               <div className="text-space">{starSystem.name}</div>
            </div>
         </div>
         <div className="divider my10" />
         <div className="title">Relationship With You</div>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row">
               <div className="f1">Distance</div>
               <div className="text-space">{starSystem.distance} lyr</div>
            </div>
            <div className="row">
               <div className="f1">Home System</div>
               <div className="text-space">
                  {starSystem.distance === 0 ? (
                     <div className="text-green mi sm">check_circle</div>
                  ) : (
                     <div className="text-red mi sm">cancel</div>
                  )}
               </div>
            </div>
            <div className="row">
               <div className="f1">Discovered</div>
               <div>
                  {starSystem.discovered ? (
                     <div className="text-green mi sm">check_circle</div>
                  ) : (
                     <div className="text-red mi sm">cancel</div>
                  )}
               </div>
            </div>
         </div>
         <div className="divider my10" />
         <div className="title">Planets</div>
         <div className="divider my10" />
         <div className="m10">
            {starSystem.planets.map((planet) => (
               <div
                  key={planet.id}
                  className="pointer"
                  onClick={() => {
                     playClick();
                     G.scene.getCurrent(GalaxyScene)?.select(planet.id);
                  }}
               >
                  <div className="row my10">
                     <TextureComp name={`Galaxy/${planet.texture}`} />
                     <div className="f1 lh-xs">
                        <div>{planet.name}</div>
                        <div className="text-sm text-dimmed">{PlanetTypeLabel[planet.type]()}</div>
                     </div>
                     <div className="text-sm">{getPlanetStatusLabel(planet)}</div>
                  </div>
               </div>
            ))}
         </div>
      </SidebarComp>
   );
}
