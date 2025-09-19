import { DefaultElementChoices, ExploreCostPerLightYear } from "@spaceship-idle/shared/src/game/definitions/Constant";
import {
   PlanetFlags,
   PlanetType,
   PlanetTypeLabel,
   type StarSystem,
   StarSystemFlags,
} from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   getConquestRewardBattleScore,
   getExploreCost,
   getPlanetStatusLabel,
   getShipClassByIndex,
} from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getElementsInShipClass, quantumToXP } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { addResource, canSpendResource, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getMaxQuantumForShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, getElementCenter, hasFlag, setFlag, shuffle } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { ChooseElementModal } from "./ChooseElementModal";
import { FloatingTip } from "./components/FloatingTip";
import { html, RenderHTML } from "./components/RenderHTMLComp";
import { ResourceListComp } from "./components/ResourceListComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError, playUpgrade } from "./Sound";

export function StarSystemPage({ starSystem }: { starSystem: StarSystem }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <SidebarComp
         title={
            <div className="row">
               {starSystem.discovered ? (
                  <TextureComp name={`Galaxy/${starSystem.texture}`} />
               ) : (
                  <div className="mi">indeterminate_question_box</div>
               )}
               <div className="f1">{t(L.XSystem, starSystem.name)}</div>
            </div>
         }
      >
         <div className="h10" />
         <div className="title">{t(L.BasicInfo)}</div>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row">
               <div className="f1">{t(L.Name)}</div>
               <div className="text-space">{starSystem.name}</div>
            </div>
         </div>
         <div className="divider my10" />
         <div className="title">{t(L.RelationshipWithYou)}</div>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row">
               <div className="f1">{t(L.Distance)}</div>
               <div className="text-space">{t(L.XLyr, starSystem.distance)}</div>
            </div>
            <div className="row">
               <div className="f1">{t(L.HomeSystem)}</div>
               <div className="text-space">
                  {starSystem.distance === 0 ? (
                     <div className="text-green mi sm">check_circle</div>
                  ) : (
                     <div className="text-red mi sm">cancel</div>
                  )}
               </div>
            </div>
            <div className="row">
               <div className="f1">{t(L.Discovered)}</div>
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
               <PlanetsComp starSystem={starSystem} />
               <ConquestRewardsComp starSystem={starSystem} />
            </>
         ) : (
            <ExplorationComp starSystem={starSystem} />
         )}
         <div className="h10" />
      </SidebarComp>
   );
}

function ConquestRewardsComp({ starSystem }: { starSystem: StarSystem }): React.ReactNode {
   const { required, current, allBattled } = getConquestRewardBattleScore(starSystem);
   return (
      <>
         <div className="divider my10" />
         <div className="title">Conquest Rewards</div>
         <div className="divider my10" />
         <div className="mx10 text-sm">{html(t(L.ConquestRewardDescHTML, required, current), "render-html")}</div>
         <div className="m10">
            {hasFlag(starSystem.flags, StarSystemFlags.ConquestRewardClaimed) ? (
               <div className="panel green row py5">
                  <div className="f1">Conquest reward claimed</div>
                  <div className="mi sm text-green">check_circle</div>
               </div>
            ) : (
               <button
                  className="btn w100 row g5 py5"
                  disabled={
                     !allBattled ||
                     current < required ||
                     hasFlag(starSystem.flags, StarSystemFlags.ConquestRewardClaimed)
                  }
                  onClick={() => {
                     if (
                        !allBattled ||
                        current < required ||
                        hasFlag(starSystem.flags, StarSystemFlags.ConquestRewardClaimed)
                     ) {
                        playError();
                        return;
                     }
                     playUpgrade();
                     const candidates = getElementsInShipClass(getShipClassByIndex(starSystem.distance));
                     const choices = shuffle(candidates.slice(0, DefaultElementChoices * 2)).slice(
                        0,
                        DefaultElementChoices,
                     );
                     if (choices.length >= DefaultElementChoices) {
                        const elementChoice = {
                           choices: choices,
                           stackSize: 1,
                        };
                        G.save.data.elementChoices.push(elementChoice);
                        starSystem.flags = setFlag(starSystem.flags, StarSystemFlags.ConquestRewardClaimed);
                        GameStateUpdated.emit();
                        showModal({
                           children: <ChooseElementModal choice={elementChoice} permanent={false} />,
                           size: "xl",
                        });
                     }
                  }}
               >
                  {t(L.PlusXXClassElement, 1, ShipClass[getShipClassByIndex(starSystem.distance)].name())}
                  <TextureComp name={"Others/Element24"} />
               </button>
            )}
         </div>
      </>
   );
}

function PlanetsComp({ starSystem }: { starSystem: StarSystem }): React.ReactNode {
   return (
      <>
         <div className="divider my10" />
         <div className="title">{t(L.Planets)}</div>
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
   );
}

function ExplorationComp({ starSystem }: { starSystem: StarSystem }): React.ReactNode {
   const exploreCost = getExploreCost(starSystem);
   let canExplore = true;
   const quantum = getMaxQuantumForShipClass(getShipClassByIndex(starSystem.distance - 1), G.save.state);
   const xp = quantumToXP(quantum + 1) - quantumToXP(quantum);
   return (
      <>
         <div className="divider my10" />
         <div className="title">{t(L.Exploration)}</div>
         <div className="divider my10" />
         <div className="mx10 text-sm">{t(L.ExplorationDesc)}</div>
         <div className="h5" />
         <div className="mx10">
            {G.save.data.galaxy.starSystems.map((starSystem) => {
               if (!starSystem.discovered) {
                  return null;
               }
               return starSystem.planets.map((planet) => {
                  const eligible =
                     planet.type === PlanetType.Me ||
                     hasFlag(planet.flags, PlanetFlags.WasFriends) ||
                     planet.battleResult;
                  if (!eligible) {
                     canExplore = false;
                  }
                  return (
                     <div key={planet.id} className="row g5">
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
         <div className="divider my10 dashed" />
         <div className="mx10 text-sm">Exploring this star system will give the following rewards</div>
         <div className="h5" />
         <div className="mx10">
            <div className="row g5">
               <TextureComp name={"Others/XP"} />
               <div className="f1">{t(L.XP)}</div>
               <div>+{formatNumber(xp)}</div>
            </div>
         </div>
         <div className="h10" />
         <div className="mx10">
            <button
               className="btn w100"
               disabled={!canExplore || !canSpendResource("VictoryPoint", exploreCost, G.save.state.resources)}
               onClick={(e) => {
                  if (!canExplore) {
                     playError();
                     return;
                  }
                  if (!trySpendResource("VictoryPoint", exploreCost, G.save.state.resources)) {
                     playError();
                     return;
                  }
                  playUpgrade();
                  starSystem.discovered = true;
                  addResource("XP", xp, G.save.state.resources, getElementCenter(e.target as HTMLElement));
                  GameStateUpdated.emit();
               }}
            >
               <FloatingTip
                  w={300}
                  label={
                     <>
                        <RenderHTML html={t(L.ExplorationCostDesc, ExploreCostPerLightYear)} className="render-html" />
                        <div className="h5" />
                        <div className="flex-table mx-10">
                           <ResourceListComp res={{ VictoryPoint: -exploreCost }} />
                        </div>
                     </>
                  }
               >
                  <div className="row g5 py5">
                     <div className="mi">explore</div>
                     <div>{t(L.ExploreX, starSystem.name)}</div>
                  </div>
               </FloatingTip>
            </button>
         </div>
      </>
   );
}
