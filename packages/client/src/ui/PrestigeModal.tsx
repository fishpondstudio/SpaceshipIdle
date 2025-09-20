import { Select } from "@mantine/core";
import { type Blueprint, Blueprints } from "@spaceship-idle/shared/src/game/definitions/Blueprints";
import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { prestige } from "@spaceship-idle/shared/src/game/logic/PrestigeLogic";
import { getTotalElementLevels } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { getFullShipBlueprint } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { cls, mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { saveGame } from "../game/LoadSave";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { FloatingTip } from "./components/FloatingTip";
import { showLoading } from "./components/LoadingComp";
import { html } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { PrestigeReason } from "./PrestigeReason";
import { ShipBlueprintComp } from "./ShipBlueprintModal";
import { playClick } from "./Sound";

export function PrestigeModal({ reason }: { reason: PrestigeReason }): React.ReactNode {
   const fromThisRun = mReduceOf(G.save.state.elements, (prev, k, v) => prev + v.hp + v.damage + v.amount, 0);
   const [blueprint, setBlueprint] = useState<Blueprint>(G.save.state.blueprint);
   const shipLayout = getFullShipBlueprint(Blueprints[blueprint].blueprint);
   const [shipClass, setShipClass] = useState<ShipClass>(ShipClassList[0]);
   const requiredElementLevel = Blueprints[blueprint].elementLevel;
   const currentElementLevel = getTotalElementLevels(G.save.state);
   const desc = Blueprints[blueprint].desc;
   return (
      <>
         {reason === PrestigeReason.Incompatible ? (
            <>
               <div className="row panel red m10 text-sm">
                  <div className="mi lg fstart">sync_problem</div>
                  <div>{t(L.PrestigeReasonInvalidShip)}</div>
               </div>
               <div className="divider my10" />
            </>
         ) : (
            <div className="h10" />
         )}
         <div className="title">{t(L.PrestigeRewards)}</div>
         <div className="divider my10" />
         <div className="row m10">
            <div>{t(L.ElementThisRun)}</div>
            <FloatingTip label={html(t(L.ElementThisRunTooltipHTML))}>
               <div className="mi sm">info</div>
            </FloatingTip>
            <div className="f1" />
            <div className="text-green">+{fromThisRun}</div>
         </div>
         <div className="divider my10" />
         <FloatingTip
            label={html(
               t(
                  L.ThisShipBlueprintRequiresPermanentElementLevelYouCurrentlyHave,
                  requiredElementLevel,
                  currentElementLevel,
               ),
            )}
         >
            <div className="title g5">
               <div className="f1">{t(L.NewShipBlueprint)}</div>
               <TextureComp name="Others/Element16" />
               <div>{requiredElementLevel}</div>
               {currentElementLevel >= requiredElementLevel ? (
                  <div className="mi xs text-green">check_circle</div>
               ) : (
                  <div className="mi xs text-red">cancel</div>
               )}
            </div>
         </FloatingTip>
         <div className="divider my10" />
         <Select
            className="m10"
            checkIconPosition="right"
            allowDeselect={false}
            data={Object.entries(Blueprints).map(([key, def]) => ({
               label: t(L.SpaceshipPrefix, def.name()),
               value: key,
            }))}
            value={blueprint}
            onChange={(value) => setBlueprint(value as Blueprint)}
         />
         {desc ? (
            <div className="panel m10 py5">
               <div className="h5" />
               <div className="title my5">{t(L.UniqueBonus)}</div>
               <div className="h5" />
               {html(desc(), "render-html")}
            </div>
         ) : null}
         <div className="panel p0 m10">
            <div className="row g0">
               <div className="f1 stretch ship-blueprint-tabs sm">
                  {ShipClassList.map((shipClass_) => (
                     <div
                        className={cls(shipClass_ === shipClass ? "active" : null)}
                        key={shipClass_}
                        onClick={() => {
                           playClick();
                           setShipClass(shipClass_);
                        }}
                     >
                        {ShipClass[shipClass_].name()}
                     </div>
                  ))}
               </div>
               <div className="divider vertical"></div>
               <div className="m20">
                  <ShipBlueprintComp
                     layout={shipLayout}
                     highlight={new Set(Blueprints[blueprint].blueprint[shipClass])}
                     width={200}
                  />
               </div>
            </div>
         </div>
         <div className="m10">
            <button
               className="btn w100 filled p5 g5 row text-lg"
               onClick={async () => {
                  hideModal();
                  showLoading();
                  prestige(G.save, blueprint);
                  await saveGame(G.save);
                  window.location.reload();
               }}
            >
               <div>{t(L.Prestige)}</div>
               <div>
                  +{fromThisRun} <TextureComp name="Others/Element16" className="inline-middle" /> {t(L.Shards)}
               </div>
            </button>
         </div>
      </>
   );
}
