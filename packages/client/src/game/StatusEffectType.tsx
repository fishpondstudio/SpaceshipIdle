import { StatusEffectType } from "@spaceship-idle/shared/src/game/definitions/StatusEffect";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";

export const StatusEffectTypeLabel: Record<StatusEffectType, string> = {
   [StatusEffectType.Mechanical]: t(L.Mechanical),
   [StatusEffectType.Electrical]: t(L.Electrical),
   [StatusEffectType.Chemical]: t(L.Chemical),
} as const;

export const StatusEffectTypeIcon: Record<StatusEffectType, string> = {
   [StatusEffectType.Mechanical]: "manufacturing",
   [StatusEffectType.Electrical]: "water_ec",
   [StatusEffectType.Chemical]: "experiment",
} as const;
