import { Badge } from "@mantine/core";
import { AbilityRangeLabel, AbilityRangeTexture } from "@spaceship-idle/shared/src/game/definitions/Ability";
import { AddonCraftInfo, AddonCraftRecipe } from "@spaceship-idle/shared/src/game/definitions/AddonCraftRecipe";
import {
   type Addon,
   AddonRequirementLabel,
   Addons,
   getAddonEffect,
} from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { canCraftAddon, craftAddon } from "@spaceship-idle/shared/src/game/logic/AddonLogic";
import { showSuccess } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { formatNumber, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { Fragment } from "react/jsx-runtime";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { playError, playUpgrade } from "../Sound";
import { FloatingTip } from "./FloatingTip";
import { html } from "./RenderHTMLComp";
import { TextureComp } from "./TextureComp";

const ShowAddonId = import.meta.env.DEV && false;

function _AddonComp({
   addon,
   showDetails,
   showCraft,
}: {
   addon: Addon;
   showDetails: boolean;
   showCraft: boolean;
}): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const amount = G.save.state.addons.get(addon)?.amount ?? 0;
   const def = Addons[addon];
   const texture = AbilityRangeTexture[def.range];
   let count = 0;
   const data = G.save.state.addons.get(addon);
   if (data?.tile) {
      const rs = G.runtime.get(data.tile);
      if (rs?.addon) {
         count = rs.addon.conditionalTargets;
      }
   }
   const recipe = AddonCraftRecipe[addon];
   const craftInfo = AddonCraftInfo[addon];
   return (
      <>
         {showDetails && (
            <>
               <div className="row g5">
                  <TextureComp name={`Addon/${addon}`} width={16} />
                  <div className="f1">{def.name()}</div>
                  <div className="text-dimmed">{ShipClass[def.shipClass].name()}</div>
               </div>
               {AddonCraftRecipe[addon] ? (
                  <div className="text-space">
                     <div className="mi inline sm">build</div> {t(L.ThisAddOnCanOnlyBeCrafted)}
                  </div>
               ) : null}
               {amount > 0 && data && data.tile === null ? (
                  <div className="text-red">
                     <div className="mi inline sm">error</div> {t(L.ThisAddOnIsNotEquipped)}
                  </div>
               ) : null}
            </>
         )}
         <div className="row">
            <div className="f1 text-dimmed">{t(L.Amount)}</div>
            <div>{formatNumber(amount)}</div>
         </div>
         <div className="row fstart wrap">
            <div className="text-dimmed">{t(L.Effect)}</div>
            <div className="f1"></div>
            <div>{def.effectDesc(getAddonEffect(amount))}</div>
         </div>
         {showDetails && (
            <>
               <div className="text-sm text-space">
                  <div className="mi inline sm">info</div> {t(L.BaseEffect)}: {def.effectDesc(getAddonEffect(1))}
               </div>
               <div className="divider dashed my10 mx-10" />
               <div className="row g5">
                  <div className="text-dimmed">{t(L.UnconditionalTarget)}</div>
                  <div className="f1" />
                  <div>{t(L.EquippedModule)}</div>
               </div>
               <div className="row g5">
                  <div className="text-dimmed">{t(L.ConditionalTarget)}</div>
                  <div className="f1" />
                  {texture && <TextureComp name={texture} />}
                  <div>{AbilityRangeLabel[def.range]()}</div>
                  <FloatingTip label={t(L.CurrentlyApplyingToConditionalTargets, count)}>
                     <Badge variant="outline" color="green" circle>
                        {count}
                     </Badge>
                  </FloatingTip>
               </div>
               <div className="row wrap fstart">
                  <div className="f1 text-dimmed">{t(L.Condition)}</div>
                  <div>{AddonRequirementLabel[def.requirement]()}</div>
               </div>
               <div className="text-sm text-space">
                  <div className="mi inline sm">info</div> {t(L.AddonEffectTooltip)}
               </div>
               {(recipe || craftInfo) && <div className="divider dashed my10 mx-10" />}
               {craftInfo && (
                  <FloatingTip
                     w={300}
                     label={
                        <>
                           <div>{html(t(L.ThisAddOnCanBeCraftedIntoTheFollowingAddOns))}</div>
                           <div className="h5" />
                           <div className="flex-table mx-10">
                              {craftInfo.map((addon) => {
                                 return (
                                    <div className="row" key={addon}>
                                       <TextureComp className="inline-middle" name={`Addon/${addon}`} />
                                       <div className="f1">{Addons[addon].name()}</div>
                                    </div>
                                 );
                              })}
                           </div>
                        </>
                     }
                  >
                     <div className="row">
                        <div className="text-dimmed">{t(L.CraftInto)}</div>
                        <div className="f1" />
                        {craftInfo.map((addon) => {
                           return (
                              <div key={addon}>
                                 <TextureComp className="inline-middle" name={`Addon/${addon}`} />
                              </div>
                           );
                        })}
                     </div>
                  </FloatingTip>
               )}
               {recipe && (
                  <FloatingTip
                     w={300}
                     label={
                        <>
                           <div>{html(t(L.ThisAddonCanBeOnlyBeCraftedFromTheFollowingRecipe))}</div>
                           <div className="h5" />
                           <div className="flex-table mx-10">
                              {mapOf(recipe, (addon, count) => {
                                 return (
                                    <div className="row" key={addon}>
                                       <TextureComp className="inline-middle" name={`Addon/${addon}`} />
                                       <div className="f1">{Addons[addon].name()}</div>
                                       <div>{count}</div>
                                       {(G.save.state.addons.get(addon)?.amount ?? 0) >= count ? (
                                          <div className="mi sm text-green">check_circle</div>
                                       ) : (
                                          <div className="mi sm text-red">cancel</div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </>
                     }
                  >
                     <div>
                        <div className="row">
                           <div className="text-dimmed">{t(L.CraftFrom)}</div>
                           <div className="f1" />
                           {mapOf(recipe, (addon, count) => {
                              return (
                                 <div key={addon}>
                                    {count} <TextureComp className="inline-middle" name={`Addon/${addon}`} />
                                 </div>
                              );
                           })}
                        </div>
                        {showCraft && (
                           <div className="panel mt5">
                              <div className="row">
                                 {mapOf(recipe, (addon, count, index) => {
                                    return (
                                       <Fragment key={addon}>
                                          {index > 0 && <div className="mi lg">add</div>}
                                          <AddonCraftItem addon={addon} count={count} />
                                       </Fragment>
                                    );
                                 })}
                                 <div className="f1 cc">
                                    <div className="mi lg">arrow_right_alt</div>
                                 </div>
                                 <AddonCraftItem addon={addon} count={1} />
                              </div>
                              <button
                                 className="btn filled w100 mt10"
                                 disabled={!canCraftAddon(addon, G.save.state)}
                                 onClick={() => {
                                    if (!canCraftAddon(addon, G.save.state)) {
                                       playError();
                                       return;
                                    }
                                    playUpgrade();
                                    craftAddon(addon, G.save.state);
                                    GameStateUpdated.emit();
                                    showSuccess(t(L.AddOnCraftedSuccessfully, Addons[addon].name()));
                                 }}
                              >
                                 <div className="mi inline">build</div> {t(L.Craft)}
                              </button>
                           </div>
                        )}
                     </div>
                  </FloatingTip>
               )}
               {ShowAddonId && <div className="text-sm text-dimmed">ID: {addon}</div>}
            </>
         )}
      </>
   );
}

function AddonCraftItem({ addon, count }: { addon: Addon; count: number }): React.ReactNode {
   return (
      <div className="row g5 addon-craft-item">
         {count > 1 && <div>{count}</div>}
         <div className="texture">
            <TextureComp name={`Addon/${addon}`} width={16 * 2} />
         </div>
      </div>
   );
}

export const AddonComp = memo(_AddonComp, (prev, next) => {
   return prev.addon === next.addon && prev.showDetails === next.showDetails && prev.showCraft === next.showCraft;
});
