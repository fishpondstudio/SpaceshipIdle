import { L, t } from "../../utils/i18n";

export const BuildingTraits = {
   AttackAbility: () => t(L.TraitAttackAbility),
   DefenseAbility: () => t(L.TraitDefenseAbility),
   SmallCaliber: () => t(L.TraitSmallCaliber),
   MediumCaliber: () => t(L.TraitMediumCaliber),
   LargeCaliber: () => t(L.TraitLargeCaliber),
   TypeA: () => t(L.TraitTypeA),
   TypeB: () => t(L.TraitTypeB),
   TypeC: () => t(L.TraitTypeC),
   TypeD: () => t(L.TraitTypeD),
   TypeE: () => t(L.TraitTypeE),
   TypeF: () => t(L.TraitTypeF),
   TypeG: () => t(L.TraitTypeG),
   Series1: () => t(L.TraitSeries1),
   Series2: () => t(L.TraitSeries2),
   Series3: () => t(L.TraitSeries3),
   Series4: () => t(L.TraitSeries4),
   Series5: () => t(L.TraitSeries5),
   Series6: () => t(L.TraitSeries6),
   Series7: () => t(L.TraitSeries7),
   Series8: () => t(L.TraitSeries8),
} as const satisfies Record<string, () => string>;

export type BuildingTrait = keyof typeof BuildingTraits;
