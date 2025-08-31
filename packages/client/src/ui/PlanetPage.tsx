import { type Planet, PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyFriendshipComp } from "./components/GalaxyFriendshipComp";
import { GalaxyWarComp } from "./components/GalaxyWarComp";
import { RenderHTML } from "./components/RenderHTMLComp";
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
            {planet.type === PlanetType.State ? (
               <RenderHTML html={t(L.NeutralStateDescHTML, planet.name)} className="render-html" />
            ) : (
               <RenderHTML html={t(L.PirateDescHTML, planet.name)} className="render-html" />
            )}
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
