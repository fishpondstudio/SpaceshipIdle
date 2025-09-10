import { ExploreCostPerLightYear } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { PlanetTypeLabel, type StarSystem } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getExploreCost, getPlanetStatusLabel } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { canSpendResource, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";
import { ResourceListComp } from "./components/ResourceListComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError, playUpgrade } from "./Sound";

export function StarSystemPage({ starSystem }: { starSystem: StarSystem }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const exploreCost = getExploreCost(starSystem);
   let canExplore = true;
   return (
      <SidebarComp
         title={
            <div className="row">
               {starSystem.discovered ? (
                  <TextureComp name={`Galaxy/${starSystem.texture}`} />
               ) : (
                  <div className="mi">indeterminate_question_box</div>
               )}
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

         {starSystem.discovered ? (
            <>
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
            </>
         ) : (
            <>
               <div className="divider my10" />
               <div className="title">Exploration</div>
               <div className="divider my10" />
               <div className="mx10 text-sm">
                  To explore this star system, you need to either be in a friendship, or have battled all discovered
                  planets
               </div>
               <div className="panel m10">
                  {G.save.data.galaxy.starSystems.map((starSystem) => {
                     if (!starSystem.discovered) {
                        return null;
                     }
                     return starSystem.planets.map((planet) => {
                        const eligible = planet.friendshipTimeLeft > 0 || planet.battleResult;
                        if (!eligible) {
                           canExplore = false;
                        }
                        return (
                           <div key={planet.id} className="row">
                              <TextureComp name={`Galaxy/${planet.texture}`} />
                              <div className="f1">{planet.name}</div>
                              {eligible ? (
                                 <div className="mi sm text-green">check_circle</div>
                              ) : (
                                 <div className="mi sm text-red">cancel</div>
                              )}
                           </div>
                        );
                     });
                  })}
               </div>
               <div className="mx10">
                  <button
                     className="btn w100"
                     disabled={!canExplore || !canSpendResource("VictoryPoint", exploreCost, G.save.state.resources)}
                     onClick={() => {
                        if (!trySpendResource("VictoryPoint", exploreCost, G.save.state.resources)) {
                           playError();
                           return;
                        }
                        playUpgrade();
                        starSystem.discovered = true;
                        GameStateUpdated.emit();
                     }}
                  >
                     <FloatingTip
                        w={300}
                        label={
                           <>
                              <RenderHTML
                                 html={t(L.ExplorationCostDesc, ExploreCostPerLightYear)}
                                 className="render-html"
                              />
                              <div className="h5" />
                              <div className="flex-table mx-10">
                                 <ResourceListComp res={{ VictoryPoint: -exploreCost }} />
                              </div>
                           </>
                        }
                     >
                        <div className="row g5 py5">
                           <div className="mi">explore</div>
                           <div>Explore {starSystem.name}</div>
                        </div>
                     </FloatingTip>
                  </button>
               </div>
            </>
         )}
      </SidebarComp>
   );
}
