import { ScrollArea } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { Catalyst, CatalystCat, CatalystCatList } from "@spaceship-idle/shared/src/game/definitions/Catalyst";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import {
   canChooseCatalystCat,
   getCatalystChoices,
   getEffect,
   getPreviousCatalystCat,
   getRequirement,
} from "@spaceship-idle/shared/src/game/logic/CatalystLogic";
import { keysOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError } from "./Sound";

export function CatalystPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <SidebarComp title={t(L.TabCatalyst)}>
         <div className="h10" />
         {CatalystCatList.map((cat, idx) => {
            const previousCat = getPreviousCatalystCat(cat);
            const choices = getCatalystChoices(cat, G.save.state);
            const selected = G.save.state.selectedCatalysts.get(cat);
            if (previousCat && !G.save.state.selectedCatalysts.has(previousCat)) {
               return null;
            }
            return (
               <div key={cat}>
                  {idx > 0 ? <div className="divider my10" /> : null}
                  <div className="title">{CatalystCat[cat].name()}</div>
                  <div className="divider my10" />
                  {selected ? (
                     <CatalystItem catalyst={selected} cat={cat} />
                  ) : (
                     choices.map((choice) => {
                        return <CatalystItem key={choice} catalyst={choice} cat={cat} />;
                     })
                  )}
               </div>
            );
         })}
      </SidebarComp>
   );
}

function CatalystItem({ catalyst, cat }: { catalyst: Catalyst; cat: CatalystCat }): React.ReactNode {
   const def = Catalyst[catalyst];
   let header: React.ReactNode = null;
   const selected = G.save.state.selectedCatalysts.get(cat);
   if (selected === catalyst) {
      if (G.runtime.leftStat.isCatalystActivated(catalyst)) {
         header = (
            <FloatingTip label={t(L.CatalystActivated)}>
               <div>
                  <div className="row g5">
                     <div className="mi sm text-green">check_circle</div>
                     <div className="f1">{getRequirement(def)}</div>
                  </div>
                  <div className="text-sm text-dimmed">{getEffect(def)}</div>
               </div>
            </FloatingTip>
         );
      } else {
         header = (
            <FloatingTip label={t(L.CatalystNotActivated)}>
               <div>
                  <div className="row g5">
                     <div className="mi sm text-red">do_not_disturb_on</div>
                     <div className="f1">{getRequirement(def)}</div>
                  </div>
                  <div className="text-sm text-dimmed">{getEffect(def)}</div>
               </div>
            </FloatingTip>
         );
      }
   } else {
      if (canChooseCatalystCat(cat, G.runtime)) {
         header = (
            <FloatingTip label={<RenderHTML html={t(L.SelectCatalystTooltipHTML)} />}>
               <div
                  className="pointer"
                  onClick={() => {
                     if (selected) {
                        playError();
                        return;
                     }
                     playClick();
                     G.save.state.selectedCatalysts.set(cat, catalyst);
                     GameStateUpdated.emit();
                  }}
               >
                  <div className="row g5">
                     <div className="mi sm">check_box_outline_blank</div>
                     <div className="f1">{getRequirement(def)}</div>
                  </div>
                  <div className="text-sm text-dimmed">{getEffect(def)}</div>
               </div>
            </FloatingTip>
         );
      } else {
         header = (
            <FloatingTip label={t(L.YouHaveToActivateThePreviousCatalystFirst)}>
               <div className="pointer">
                  <div className="row g5">
                     <div className="mi sm">lock</div>
                     <div className="f1">{getRequirement(def)}</div>
                  </div>
                  <div className="text-sm text-dimmed">{getEffect(def)}</div>
               </div>
            </FloatingTip>
         );
      }
   }
   return (
      <div className="panel m10" key={catalyst}>
         {header}
         <div className="divider dashed mx-10 my10" />
         <ScrollArea scrollbars="x" offsetScrollbars="x" type="auto" styles={{ content: { display: "flex" } }}>
            {keysOf(Config.Buildings)
               .filter(def.filter)
               .map((b) => {
                  return (
                     <FloatingTip
                        w={350}
                        label={
                           <>
                              <div className="row g5">
                                 <TextureComp name={`Building/${b}`} />
                                 <div className="text-lg">{getBuildingName(b)}</div>
                              </div>
                              <BuildingInfoComp building={b} />
                           </>
                        }
                        key={b}
                     >
                        <TextureComp style={{ flexShrink: 0 }} name={`Building/${b}`} width={64} />
                     </FloatingTip>
                  );
               })}
         </ScrollArea>
      </div>
   );
}
