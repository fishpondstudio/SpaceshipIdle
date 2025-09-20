import { Config } from "@spaceship-idle/shared/src/game/Config";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import type { Tech } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { showInfo } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { getTotalElementLevels } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { canSpendResource, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import {
   checkTechPrerequisites,
   getShipClass,
   getTechName,
   techColumnToShipClass,
} from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ShipScene } from "../scenes/ShipScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { ResourceListComp } from "./components/ResourceListComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { TitleComp } from "./components/TitleComp";
import { playUpgrade } from "./Sound";

export function TechPage({ tech }: { tech: Tech }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const def = Config.Tech[tech];
   const canUnlock = checkTechPrerequisites(tech, G.save.state);
   const shipClass = techColumnToShipClass(def.position.x);
   const elementLevel = ShipClass[shipClass].elementLevels;
   const currentLevel = getTotalElementLevels(G.save.state);
   return (
      <SidebarComp
         title={
            <div className="row">
               <div className="f1">{getTechName(tech)}</div>
            </div>
         }
      >
         <div className="h10" />
         {!G.save.state.unlockedTech.has(tech) && def.requires.length > 0 ? (
            <>
               <TitleComp>{t(L.Prerequisites)}</TitleComp>
               <div className="divider my10" />
               {elementLevel > 0 ? (
                  <FloatingTip
                     label={html(t(L.RequirePermanentElementLevelsAndYouCurrentlyHave, elementLevel, currentLevel))}
                  >
                     <div className="row mx10 my5">
                        <div className="f1">
                           <span className="text-space">{elementLevel}</span> {t(L.PermanentElementLevels)}
                        </div>
                        {currentLevel >= elementLevel ? (
                           <div className="mi text-green">check_circle</div>
                        ) : (
                           <div className="mi text-red">cancel</div>
                        )}
                     </div>
                  </FloatingTip>
               ) : null}
               {def.requires.map((req) => {
                  return (
                     <div className="row mx10 my5" key={req}>
                        <div className="f1">
                           {t(L.ResearchVerb)} <span className="text-space">{getTechName(req)}</span>
                        </div>
                        {G.save.state.unlockedTech.has(req) ? (
                           <div className="mi text-green">check_circle</div>
                        ) : (
                           <div className="mi text-red">cancel</div>
                        )}
                     </div>
                  );
               })}
               <div className="divider my10" />
               <div className="mx10">
                  <button
                     className="btn filled w100 px10 py5"
                     onClick={() => {
                        if (
                           !checkTechPrerequisites(tech, G.save.state) ||
                           !canSpendResource("Quantum", 1, G.save.state.resources) ||
                           currentLevel < elementLevel
                        ) {
                           return;
                        }
                        trySpendResource("Quantum", 1, G.save.state.resources);
                        playUpgrade();
                        const oldShipClass = getShipClass(G.save.state);
                        G.save.state.unlockedTech.add(tech);
                        const newShipClass = getShipClass(G.save.state);
                        if (oldShipClass !== newShipClass) {
                           G.scene.enqueue(ShipScene, (s) => s.requestBlueprintUpdate());
                           showInfo(t(L.YouHaveUnlockedClassSpaceship, ShipClass[newShipClass].name()), true);
                           if (G.save.state.blueprint === "Majestic") {
                              G.save.state.stats.set("Warmonger", 0);
                              G.save.state.stats.set("Backstabber", 0);
                           }
                        }
                        GameStateUpdated.emit();
                        G.scene.enqueue(TechTreeScene, (t) => t.refresh());
                     }}
                     disabled={
                        !canUnlock ||
                        !canSpendResource("Quantum", 1, G.save.state.resources) ||
                        currentLevel < elementLevel
                     }
                  >
                     <FloatingTip
                        w={300}
                        label={
                           <div className="flex-table mx-10">
                              <div className="row">
                                 <div className="f1">{t(L.Prerequisites)}</div>
                                 {canUnlock && currentLevel >= elementLevel ? (
                                    <div className="mi text-green xs">check_circle</div>
                                 ) : (
                                    <div className="mi text-red xs">cancel</div>
                                 )}
                              </div>
                              <ResourceListComp res={{ Quantum: -1 }} />
                           </div>
                        }
                     >
                        <div className="row">
                           <div>{t(L.Research)}</div>
                           <div className="f1" />
                           <div>-1</div>
                           <TextureComp name="Others/Quantum24" className="inline-middle" />
                        </div>
                     </FloatingTip>
                  </button>
               </div>
               <div className="divider mt10 mb10" />
            </>
         ) : null}
         {def.unlockBuildings ? (
            <>
               <TitleComp>{t(L.UnlockModules)}</TitleComp>
               <div className="divider my10" />
               {def.unlockBuildings?.map((b) => {
                  return (
                     <div key={b}>
                        <FloatingTip w={350} label={<BuildingInfoComp building={b} />}>
                           <div className="row m10">
                              <TextureComp name={`Building/${b}`} width={64} />
                              <div className="f1">
                                 <div>{getBuildingName(b)}</div>
                              </div>
                           </div>
                        </FloatingTip>
                        <div className="divider my10" />
                     </div>
                  );
               })}
            </>
         ) : null}
         {def.multiplier ? (
            <>
               <TitleComp>{t(L.TechMultiplierBoost)}</TitleComp>
               <div className="divider my10" />
               {mapOf(def.multiplier, (b, multiplier) => {
                  return (
                     <div key={b} className="m10">
                        <div className="f1">{getBuildingName(b)}</div>
                        <div className="row text-sm text-dimmed">
                           <div className="f1">{t(L.HPMultiplier)}</div>
                           <div>+{formatNumber(multiplier.hp)}</div>
                        </div>
                        <div className="row text-sm text-dimmed">
                           <div className="f1">{t(L.DamageMultiplier)}</div>
                           <div>+{formatNumber(multiplier.damage)}</div>
                        </div>
                     </div>
                  );
               })}
               <div className="divider my10" />
            </>
         ) : null}
         {def.unlockUpgrades ? (
            <>
               <TitleComp>{t(L.UnlockUpgrades)}</TitleComp>
               <div className="divider my10" />
               {def.unlockUpgrades?.map((u) => {
                  return (
                     <div key={u.name()}>
                        <div className="m10">
                           <div className="f1">{u.name()}</div>
                           <div className="text-dimmed text-xs">{u.desc()}</div>
                        </div>
                        <div className="divider my10" />
                     </div>
                  );
               })}
            </>
         ) : null}
      </SidebarComp>
   );
}
