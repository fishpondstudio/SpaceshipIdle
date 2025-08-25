import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { FriendshipComp } from "./components/FriendshipComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { WarComp } from "./components/WarComp";

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
         <div className="m10 text-sm">
            Before making a decision, you can build a spy network to gather more intelligence about them
         </div>
         <div className="mx10">
            <div className="panel">
               <div className="title">Cost</div>
               <div className="h5" />1 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
            </div>
            <div className="h10" />
            <button className="btn w100 row g5">
               <div className="mi sm">visibility</div>
               <div>Build Spy Network</div>
            </button>
         </div>
         <div className="divider my10" />
         <div className="title g5">
            <div className="mi sm">handshake</div>
            <div>Declare Friendship</div>
         </div>
         <div className="divider my10" />
         <div className="mx10">
            <FriendshipComp planet={planet} />
         </div>
         <div className="divider my10" />
         <div className="title g5">
            <div className="mi sm">swords</div>
            <div>Declare War</div>
         </div>
         <div className="divider my10" />
         <div className="mx10">
            <WarComp planet={planet} />
         </div>
         <div className="h10" />
      </SidebarComp>
   );
}
