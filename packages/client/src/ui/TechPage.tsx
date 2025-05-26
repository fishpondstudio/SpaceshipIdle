import { Badge, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Tech } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingDesc } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { getAvailableQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import {
   checkTechPrerequisites,
   checkTierRequirement,
   getTechName,
} from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, mapOf, numberToRoman } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { TitleComp } from "./components/TitleComp";
import { playUpgrade } from "./Sound";

export function TechPage({ tech }: { tech: Tech }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const def = Config.Tech[tech];
   const tier = numberToRoman(def.ring);
   const prevTier = numberToRoman(def.ring - 1);
   const { required, unlocked } = checkTierRequirement(def.ring, G.save.current);
   const canUnlock = checkTechPrerequisites(tech, G.save.current) && unlocked >= required;
   return (
      <SidebarComp
         title={
            <div className="row">
               {tier ? <Badge variant="outline">{t(L.TierX, tier)}</Badge> : null}
               <div className="f1">{getTechName(tech)}</div>
            </div>
         }
      >
         <div className="h10" />
         {!G.save.current.unlockedTech.has(tech) && def.requires.length > 0 ? (
            <>
               <TitleComp>{t(L.Prerequisites)}</TitleComp>
               <div className="divider my10" />
               {prevTier ? (
                  <div className="row mx10 my5">
                     <div className="f1">{t(L.ResearchTierTech, required, prevTier)}</div>
                     {unlocked >= required ? (
                        <div className="mi text-green">check_circle</div>
                     ) : (
                        <div className="mi text-red">cancel</div>
                     )}
                  </div>
               ) : null}
               {def.requires.map((req) => {
                  return (
                     <div className="row mx10 my5" key={req}>
                        <div className="f1">{getTechName(req)}</div>
                        {G.save.current.unlockedTech.has(req) ? (
                           <div className="mi text-green">check_circle</div>
                        ) : (
                           <div className="mi text-red">cancel</div>
                        )}
                     </div>
                  );
               })}
               <div className="divider my10" />
               <div className="mx10">
                  <Tooltip disabled={getAvailableQuantum(G.save.current) > 0} label={t(L.NotEnoughQuantum)}>
                     <button
                        className="btn filled w100 row px10 py5"
                        onClick={() => {
                           if (
                              !checkTechPrerequisites(tech, G.save.current) ||
                              getAvailableQuantum(G.save.current) <= 0 ||
                              unlocked < required
                           ) {
                              return;
                           }
                           playUpgrade();
                           G.save.current.unlockedTech.add(tech);
                           GameStateUpdated.emit();
                           G.scene.enqueue(TechTreeScene, (t) => t.refresh());
                        }}
                        disabled={!canUnlock || getAvailableQuantum(G.save.current) <= 0}
                     >
                        <div>{t(L.Research)}</div>
                        <div className="f1" />
                        <div>-1</div>
                        <div className="mi">orbit</div>
                     </button>
                  </Tooltip>
               </div>
               <div className="divider mt10 mb10" />
            </>
         ) : null}
         {def.unlockBuildings ? (
            <>
               <TitleComp>{t(L.UnlockBuildings)}</TitleComp>
               <div className="divider my10" />
               {def.unlockBuildings?.map((b) => {
                  return (
                     <div key={b}>
                        <Tooltip
                           multiline
                           color="gray"
                           label={
                              <div style={{ width: 330 }}>
                                 <BuildingInfoComp building={b} />
                              </div>
                           }
                        >
                           <div className="row m10">
                              <TextureComp name={`Building/${b}`} size={50} />
                              <div className="f1">
                                 <div>{Config.Buildings[b].name()}</div>
                                 <div className="text-dimmed text-xs">{getBuildingDesc(b)}</div>
                              </div>
                           </div>
                        </Tooltip>
                        <div className="divider my10" />
                     </div>
                  );
               })}
            </>
         ) : null}
         {def.multiplier ? (
            <>
               <TitleComp>{t(L.ProductionMultiplier)}</TitleComp>
               <div className="divider my10" />
               {mapOf(def.multiplier, (b, amount) => {
                  return (
                     <div key={b}>
                        <div className="row m10">
                           <div className="f1">{Config.Buildings[b].name()}</div>
                           <div>+{formatNumber(amount)}</div>
                        </div>
                        <div className="divider my10" />
                     </div>
                  );
               })}
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
