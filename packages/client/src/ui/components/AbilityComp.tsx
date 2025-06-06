import { Image, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import {
   AbilityRange,
   AbilityRangeLabel,
   AbilityTargetLabel,
   AbilityTimingLabel,
} from "@spaceship-idle/shared/src/game/definitions/Ability";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { StatusEffects } from "@spaceship-idle/shared/src/game/definitions/StatusEffect";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import Adjacent from "../../assets/images/Adjacent.png";
import FrontTrio from "../../assets/images/FrontTrio.png";
import RearTrio from "../../assets/images/RearTrio.png";
import { StatusEffectTypeIcon, StatusEffectTypeLabel } from "../../game/StatusEffectType";

export const AbilityRangeImage: Partial<Record<AbilityRange, string>> = {
   [AbilityRange.Adjacent]: Adjacent,
   [AbilityRange.RearTrio]: RearTrio,
   [AbilityRange.FrontTrio]: FrontTrio,
};

export function AbilityComp({
   level,
   building,
   space,
   title,
}: { level: number; building: Building; title?: React.ReactNode; space?: React.ReactNode }): React.ReactNode {
   const def = Config.Buildings[building];
   if (!("ability" in def) || !def.ability) {
      return null;
   }
   const ability = def.ability;
   const duration = ability.duration(building, level);
   return (
      <>
         {title}
         <div className="row g5">
            <div className="f1">{t(L.AbilityTiming)}</div>
            <div>{AbilityTimingLabel[ability.timing]()}</div>
         </div>
         {space}
         <div className="row g5">
            <div className="f1">{t(L.AbilityTarget)}</div>
            <div>{AbilityTargetLabel[ability.timing]()}</div>
         </div>
         {ability.range !== AbilityRange.Single ? (
            <div className="row g5">
               <div className="f1" />
               <Tooltip
                  p={5}
                  disabled={!AbilityRangeImage[ability.range]}
                  label={<Image radius="sm" w={200} src={AbilityRangeImage[ability.range]} />}
               >
                  <div className="text-space">{AbilityRangeLabel[ability.range]()}</div>
               </Tooltip>
            </div>
         ) : null}
         {space}
         <div className="row g5">
            <div className="f1">{t(L.AbilityEffect)}</div>
            <div>{StatusEffects[ability.effect].name()}</div>
            <Tooltip label={StatusEffectTypeLabel[StatusEffects[ability.effect].type]}>
               <div className="mi sm">{StatusEffectTypeIcon[StatusEffects[ability.effect].type]}</div>
            </Tooltip>
         </div>
         <div className="text-space" style={{ textAlign: "right" }}>
            {StatusEffects[ability.effect].desc(ability.value(building, level))}
            {duration > 0 ? ` (${t(L.AbilityDuration)} ${t(L.AbilityDurationSeconds, duration)})` : ""}
         </div>
      </>
   );
}
