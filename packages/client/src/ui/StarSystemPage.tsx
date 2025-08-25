import type { StarSystem } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

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
            <div className="row">
               <div className="f1">Planets</div>
               <div className="text-space">{starSystem.planets.length}</div>
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
                     <div className="mi sm">check_circle</div>
                  ) : (
                     <div className="mi sm">cancel</div>
                  )}
               </div>
            </div>
         </div>
      </SidebarComp>
   );
}
