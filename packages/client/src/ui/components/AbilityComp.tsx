import { Config } from "@spaceship-idle/shared/src/game/Config";
import {
   AbilityRange,
   AbilityRangeLabel,
   AbilityRangeTexture,
   AbilityTargetLabel,
   AbilityTiming,
   AbilityTimingLabel,
} from "@spaceship-idle/shared/src/game/definitions/Ability";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { StatusEffects } from "@spaceship-idle/shared/src/game/definitions/StatusEffect";
import { DefaultMultipliers } from "@spaceship-idle/shared/src/game/logic/IMultiplier";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { StatusEffectTypeIcon, StatusEffectTypeLabel } from "../../game/StatusEffectType";
import { FloatingTip } from "./FloatingTip";
import { TextureComp } from "./TextureComp";

export function AbilityComp({
   level,
   building,
   title,
}: {
   level: number;
   building: Building;
   title?: React.ReactNode;
   space?: React.ReactNode;
}): React.ReactNode {
   const def = Config.Buildings[building];
   if (!("ability" in def) || !def.ability) {
      return null;
   }
   const ability = def.ability;
   const duration = ability.duration(building, level, DefaultMultipliers);
   const texture = AbilityRangeTexture[ability.range];
   return (
      <>
         {title}
         <div className="row g5">
            <div className="f1">{t(L.AbilityTiming)}</div>
            <div>{AbilityTimingLabel[ability.timing]()}</div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.AbilityTarget)}</div>
            {ability.timing === AbilityTiming.OnHit ? (
               <div className="mi sm text-red">target</div>
            ) : (
               <div className="mi sm text-green">account_circle</div>
            )}
            <div>{AbilityTargetLabel[ability.timing]()}</div>
         </div>
         {ability.range !== AbilityRange.Single ? (
            <div className="row g5">
               <div className="f1" />
               {texture && <TextureComp name={texture} />}
               <div className="text-space">{AbilityRangeLabel[ability.range]()}</div>
            </div>
         ) : null}
         <div className="row g5">
            <div className="f1">{t(L.AbilityEffect)}</div>
            <div>{StatusEffects[ability.effect].name()}</div>
            <FloatingTip label={StatusEffectTypeLabel[StatusEffects[ability.effect].type]}>
               <div className="mi sm">{StatusEffectTypeIcon[StatusEffects[ability.effect].type]}</div>
            </FloatingTip>
         </div>
         <div className="text-space" style={{ textAlign: "right" }}>
            {StatusEffects[ability.effect].desc(ability.value(building, level, DefaultMultipliers))} (
            {t(L.AbilityDuration)} {t(L.AbilityDurationSeconds, duration)})
         </div>
      </>
   );
}
