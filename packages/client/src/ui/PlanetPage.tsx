import { type Planet, PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GalaxyFriendshipComp } from "./components/GalaxyFriendshipComp";
import { GalaxyWarComp } from "./components/GalaxyWarComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { GalaxySpyComp } from "./GalaxySpyComp";

export function PlanetPage({ planet }: { planet: Planet }): React.ReactNode {
   return (
      <SidebarComp
         title={
            <div className="row">
               <TextureComp name={`Galaxy/${planet.texture}`} />
               <div className="f1">{planet.name}</div>
            </div>
         }
      >
         <div className="m10 text-sm">
            <div>
               <span className="text-space">{planet.name}</span> is a neutral state. You can decide how do engage with
               them
            </div>
         </div>
         <div className="divider my10" />
         <div className="title g5">
            <div className="mi sm">visibility</div>
            <div>Gather Intelligence</div>
         </div>
         <div className="divider my10" />
         <div className="mx10">
            <GalaxySpyComp planet={planet} />
         </div>
         {planet.type === PlanetType.State ? (
            <>
               <div className="divider my10" />
               <div className="title g5">
                  <div className="mi sm">handshake</div>
                  <div>Declare Friendship</div>
               </div>
               <div className="divider my10" />
               <div className="mx10">
                  <GalaxyFriendshipComp planet={planet} />
               </div>
            </>
         ) : null}
         {planet.type !== PlanetType.Me ? (
            <>
               <div className="divider my10" />
               <div className="title g5">
                  <div className="mi sm">swords</div>
                  <div>Declare War</div>
               </div>
               <div className="divider my10" />
               <div className="mx10">
                  <GalaxyWarComp planet={planet} />
               </div>
            </>
         ) : null}
         <div className="h10" />
      </SidebarComp>
   );
}
