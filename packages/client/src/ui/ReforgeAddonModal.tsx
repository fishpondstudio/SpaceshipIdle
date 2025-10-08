import { SegmentedControl } from "@mantine/core";
import { type Addon, Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   addAddon,
   deductAddon,
   getReforgeCost,
   getReforgeVictoryPoint,
} from "@spaceship-idle/shared/src/game/logic/AddonLogic";
import { showSuccess } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import {
   addResource,
   canSpendResource,
   resourceOf,
   trySpendResource,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getElementCenter } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useState } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { ResourceListComp, ResourceRequirementComp } from "./components/ResourceListComp";
import { TextureComp } from "./components/TextureComp";
import { SelectAddonComp } from "./SelectAddonComp";
import { playBling, playError } from "./Sound";

export function ReforgeAddonModal(): React.ReactNode {
   const [tab, setTab] = useState<"addon" | "victorypoint">("addon");
   return (
      <>
         <SegmentedControl
            style={{ background: "transparent" }}
            data={[
               {
                  value: "addon",
                  label: t(L.Addon),
               },
               {
                  value: "victorypoint",
                  label: t(L.VictoryPoint),
               },
            ]}
            className="p5 w100"
            onChange={(value) => setTab(value as "addon" | "victorypoint")}
            value={tab}
         />
         <div className="divider" />
         {tab === "addon" ? <AddonToAddonTab /> : <AddonToVictoryPointTab />}
      </>
   );
}

function AddonToVictoryPointTab(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [fromAddon, setFromAddon] = useState<Addon | null>(null);
   const reforgeCost = fromAddon ? getReforgeVictoryPoint(fromAddon, G.save.state) : 0;
   return (
      <div className="m10">
         <SelectAddonComp value={fromAddon} onChange={setFromAddon} />
         {reforgeCost === 0 ? <div className="panel yellow mt10">{t(L.ReforgeAddonVictoryPointDesc)}</div> : null}
         {fromAddon && reforgeCost > 0 ? (
            <div className="panel mt10">
               <div className="title">{t(L.Consume)}</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${fromAddon}`} />
                  <div>{Addons[fromAddon].name()}</div>
                  <div className="text-space">x{reforgeCost}</div>
                  <div className="f1" />
                  <div className="text-dimmed text-sm">
                     {t(L.YouHaveX, G.save.state.addons.get(fromAddon)?.amount ?? 0)}
                  </div>
                  {reforgeCost > 0 && (G.save.state.addons.get(fromAddon)?.amount ?? 0) >= reforgeCost ? (
                     <div className="mi text-green sm">check_circle</div>
                  ) : (
                     <div className="mi text-red sm">cancel</div>
                  )}
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">{t(L.Produce)}</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={"Others/Trophy16"} />
                  <div>{t(L.VictoryPoint)}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
               </div>
            </div>
         ) : null}
         <div className="h10" />
         <FloatingTip
            w={300}
            label={
               <>
                  <div>{t(L.TheFollowingResourcesWillBeConsumed)}</div>
                  <div className="h5" />
                  <div className="flex-table mx-10">
                     {fromAddon && reforgeCost > 0 ? (
                        <ResourceRequirementComp
                           name={Addons[fromAddon].name()}
                           required={-reforgeCost}
                           current={G.save.state.addons.get(fromAddon)?.amount ?? 0}
                           texture={`Addon/${fromAddon}`}
                        />
                     ) : null}
                  </div>
               </>
            }
         >
            <button
               className="btn w100 filled row py5"
               disabled={
                  reforgeCost === 0 || !fromAddon || (G.save.state.addons.get(fromAddon)?.amount ?? 0) < reforgeCost
               }
               onClick={(e) => {
                  if (
                     reforgeCost === 0 ||
                     !fromAddon ||
                     (G.save.state.addons.get(fromAddon)?.amount ?? 0) < reforgeCost
                  ) {
                     playError();
                     return;
                  }
                  deductAddon(fromAddon, reforgeCost, G.save.state);
                  addResource("VictoryPoint", 1, G.save.state.resources, getElementCenter(e.target as HTMLElement));
                  GameStateUpdated.emit();
                  playBling();
                  showSuccess(t(L.AddOnReforgedSuccessfully, t(L.VictoryPoint)));
               }}
            >
               <div className="mi">chart_data</div>
               <div>{t(L.Reforge)}</div>
            </button>
         </FloatingTip>
      </div>
   );
}

function AddonToAddonTab(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [fromAddon, setFromAddon] = useState<Addon | null>(null);
   const [toAddon, setToAddon] = useState<Addon | null>(null);
   const reforgeCost = fromAddon && toAddon ? getReforgeCost(fromAddon, toAddon) : 0;
   return (
      <div className="m10">
         <SelectAddonComp value={fromAddon} onChange={setFromAddon} />
         <div className="cc my5">
            <div className="mi">south</div>
         </div>
         <SelectAddonComp value={toAddon} onChange={setToAddon} />
         {reforgeCost === 0 ? <div className="panel yellow mt10">{t(L.ReforgeAddonDesc)}</div> : null}
         {fromAddon && toAddon && reforgeCost > 0 ? (
            <div className="panel mt10">
               <div className="title">{t(L.Consume)}</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${fromAddon}`} />
                  <div>{Addons[fromAddon].name()}</div>
                  <div className="text-space">x{reforgeCost}</div>
                  <div className="f1" />
                  <div className="text-dimmed text-sm">
                     {t(L.YouHaveX, G.save.state.addons.get(fromAddon)?.amount ?? 0)}
                  </div>
                  {reforgeCost > 0 && (G.save.state.addons.get(fromAddon)?.amount ?? 0) >= reforgeCost ? (
                     <div className="mi text-green sm">check_circle</div>
                  ) : (
                     <div className="mi text-red sm">cancel</div>
                  )}
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">{t(L.Produce)}</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${toAddon}`} />
                  <div>{Addons[toAddon].name()}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">{t(L.ReforgeCost)}</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={"Others/Trophy16"} />
                  <div>{t(L.VictoryPoint)}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
                  <div className="text-dimmed text-sm">
                     {t(L.YouHaveX, resourceOf("VictoryPoint", G.save.state.resources).current)}
                  </div>
                  {canSpendResource("VictoryPoint", 1, G.save.state.resources) ? (
                     <div className="mi text-green sm">check_circle</div>
                  ) : (
                     <div className="mi text-red sm">cancel</div>
                  )}
               </div>
            </div>
         ) : null}
         <div className="h10" />
         <FloatingTip
            w={300}
            label={
               <>
                  <div>{t(L.TheFollowingResourcesWillBeConsumed)}</div>
                  <div className="h5" />
                  <div className="flex-table mx-10">
                     {fromAddon && reforgeCost > 0 ? (
                        <ResourceRequirementComp
                           name={Addons[fromAddon].name()}
                           required={-reforgeCost}
                           current={G.save.state.addons.get(fromAddon)?.amount ?? 0}
                           texture={`Addon/${fromAddon}`}
                        />
                     ) : null}
                     <ResourceListComp res={{ VictoryPoint: -1 }} />
                  </div>
               </>
            }
         >
            <button
               className="btn w100 filled row py5"
               disabled={
                  reforgeCost === 0 ||
                  !fromAddon ||
                  !toAddon ||
                  (G.save.state.addons.get(fromAddon)?.amount ?? 0) < reforgeCost ||
                  !canSpendResource("VictoryPoint", 1, G.save.state.resources)
               }
               onClick={(e) => {
                  if (reforgeCost === 0 || !fromAddon || !toAddon) {
                     playError();
                     return;
                  }
                  const currentAmount = G.save.state.addons.get(fromAddon)?.amount ?? 0;
                  if (currentAmount < reforgeCost) {
                     playError();
                     return;
                  }
                  if (!canSpendResource("VictoryPoint", 1, G.save.state.resources)) {
                     playError();
                     return;
                  }
                  trySpendResource("VictoryPoint", 1, G.save.state.resources);
                  deductAddon(fromAddon, reforgeCost, G.save.state);
                  addAddon(toAddon, 1, G.save.state, getElementCenter(e.target as HTMLElement));
                  GameStateUpdated.emit();
                  playBling();
                  showSuccess(t(L.AddOnReforgedSuccessfully, Addons[toAddon].name()));
               }}
            >
               <div className="mi">chart_data</div>
               <div>{t(L.Reforge)}</div>
            </button>
         </FloatingTip>
      </div>
   );
}
