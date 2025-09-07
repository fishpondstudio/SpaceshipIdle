import { type Addon, Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getFuseCost } from "@spaceship-idle/shared/src/game/logic/AddonLogic";
import { canSpendResource, resourceOf, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { mapSafeSet } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useState } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { ResourceListComp, ResourceRequirementComp } from "./components/ResourceListComp";
import { TextureComp } from "./components/TextureComp";
import { SelectAddonComp } from "./SelectAddonComp";
import { playError, playUpgrade } from "./Sound";

export function FuseAddonModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [fromAddon, setFromAddon] = useState<Addon | null>(null);
   const [toAddon, setToAddon] = useState<Addon | null>(null);
   const fuseCost = fromAddon && toAddon ? getFuseCost(fromAddon, toAddon) : 0;
   return (
      <div className="m10">
         <SelectAddonComp value={fromAddon} onChange={setFromAddon} />
         <div className="cc my5">
            <div className="mi">south</div>
         </div>
         <SelectAddonComp value={toAddon} onChange={setToAddon} />
         {fuseCost === 0 ? (
            <div className="panel yellow mt10">
               You can fuse a lower class add-on into a higher (or equal) class add-on. Only discovered add-ons can be
               fused.
            </div>
         ) : null}
         {fromAddon && toAddon && fuseCost > 0 ? (
            <div className="panel mt10">
               <div className="title">Consume</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${fromAddon}`} />
                  <div>{Addons[fromAddon].name()}</div>
                  <div className="text-space">x{fuseCost}</div>
                  <div className="f1" />
                  <div className="text-dimmed text-sm">You have {G.save.state.addons.get(fromAddon)?.amount ?? 0}</div>
                  {fuseCost > 0 && (G.save.state.addons.get(fromAddon)?.amount ?? 0) >= fuseCost ? (
                     <div className="mi text-green sm">check_circle</div>
                  ) : (
                     <div className="mi text-red sm">cancel</div>
                  )}
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">Produce</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${toAddon}`} />
                  <div>{Addons[toAddon].name()}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">Fuse Cost</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={"Others/Trophy16"} />
                  <div>{t(L.VictoryPoint)}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
                  <div className="text-dimmed text-sm">
                     You have {resourceOf("VictoryPoint", G.save.state.resources).current}
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
                  <div>The following resources will be consumed</div>
                  <div className="h5" />
                  <div className="flex-table mx-10">
                     {fromAddon && fuseCost > 0 ? (
                        <ResourceRequirementComp
                           name={Addons[fromAddon].name()}
                           required={-fuseCost}
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
                  fuseCost === 0 ||
                  !fromAddon ||
                  !toAddon ||
                  (G.save.state.addons.get(fromAddon)?.amount ?? 0) < fuseCost
               }
               onClick={() => {
                  if (fuseCost === 0 || !fromAddon) {
                     playError();
                     return;
                  }
                  const currentAmount = G.save.state.addons.get(fromAddon)?.amount ?? 0;
                  if (currentAmount < fuseCost) {
                     playError();
                     return;
                  }
                  if (!canSpendResource("VictoryPoint", 1, G.save.state.resources)) {
                     playError();
                     return;
                  }
                  trySpendResource("VictoryPoint", 1, G.save.state.resources);
                  mapSafeSet(G.save.state.addons, fromAddon, (oldValue) => {
                     if (oldValue) {
                        oldValue.amount -= fuseCost;
                        return oldValue;
                     }
                     throw new Error("Fuse addon: this should never happen!");
                  });
                  mapSafeSet(G.save.state.addons, toAddon, (oldValue) => {
                     if (oldValue) {
                        oldValue.amount += 1;
                        return oldValue;
                     }
                     return { amount: 1, tile: null };
                  });
                  GameStateUpdated.emit();
                  playUpgrade();
               }}
            >
               <div className="mi">chart_data</div>
               <div>Fuse</div>
            </button>
         </FloatingTip>
      </div>
   );
}
