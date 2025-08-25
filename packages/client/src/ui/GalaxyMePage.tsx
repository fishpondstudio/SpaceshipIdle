import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

export function GalaxyMePage({ planet }: { planet: Planet }): React.ReactNode {
   return (
      <SidebarComp
         title={
            <div className="row">
               <TextureComp name={`Galaxy/${planet.texture}`} />
               <div className="f1">You</div>
            </div>
         }
      >
         <div className="m10">TODO</div>
      </SidebarComp>
   );
}
