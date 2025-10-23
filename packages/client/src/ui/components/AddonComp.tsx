import { Badge } from "@mantine/core";
import { AbilityRangeLabel, AbilityRangeTexture } from "@spaceship-idle/shared/src/game/definitions/Ability";
import {
   type Addon,
   AddonCraftInfo,
   AddonCraftRecipe,
   AddonRequirementLabel,
   Addons,
   getAddonEffect,
} from "@spaceship-idle/shared/src/game/definitions/Addons";
import { formatNumber, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import { FloatingTip } from "./FloatingTip";
import { html } from "./RenderHTMLComp";
import { TextureComp } from "./TextureComp";

export function AddonComp({
   addon,
   amount,
   showDetails,
}: {
   addon: Addon;
   amount: number;
   showDetails?: boolean;
}): React.ReactNode {
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
         <div className="row">
            <div className="f1">{t(L.Amount)}</div>
            <div>{formatNumber(amount)}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.Effect)}</div>
            <div>{def.effectDesc(getAddonEffect(amount))}</div>
         </div>
         {showDetails && (
            <>
               <div className="row g5">
                  <div>{t(L.UnconditionalTarget)}</div>
                  <FloatingTip label={html(t(L.AddonEffectTooltipHTML))}>
                     <div className="mi sm text-dimmed">help</div>
                  </FloatingTip>
                  <div className="f1" />
                  <div>{t(L.EquippedModule)}</div>
               </div>
               <div className="row g5">
                  <div>{t(L.ConditionalTarget)}</div>
                  <FloatingTip label={html(t(L.AddonEffectTooltipHTML))}>
                     <div className="mi sm text-dimmed">help</div>
                  </FloatingTip>
                  <div className="f1" />
                  {texture && <TextureComp name={texture} />}
                  <div>{AbilityRangeLabel[def.range]()}</div>
                  <FloatingTip label={t(L.CurrentlyApplyingToConditionalTargets, count)}>
                     <Badge variant="outline" color="green" circle>
                        {count}
                     </Badge>
                  </FloatingTip>
               </div>
               <div className="text-space">
                  {t(L.Condition)}: {AddonRequirementLabel[def.requirement]()}
               </div>
               <div className="divider dashed my5 mx-10" />
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
                                    </div>
                                 );
                              })}
                           </div>
                        </>
                     }
                  >
                     <div className="row">
                        <div>Craft From</div>
                        <div className="f1" />
                        {mapOf(recipe, (addon, count) => {
                           return (
                              <div key={addon}>
                                 {count} <TextureComp className="inline-middle" name={`Addon/${addon}`} />
                              </div>
                           );
                        })}
                     </div>
                  </FloatingTip>
               )}
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
                        <div>Craft Into</div>
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
            </>
         )}
      </>
   );
}
