import { L, t } from "../../utils/i18n";
import { AbilityRange } from "./Ability";
import { BoosterDefenseProps, BuildingFlag, type IBoosterDefinition } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const PM1Booster: IBoosterDefinition = {
   ...BoosterDefenseProps,
   name: () => t(L.PM1Booster),
   desc: () => t(L.PM1BoosterDesc),
   code: CodeNumber.BT,
   buildingFlag: BuildingFlag.CanRotate | BuildingFlag.Booster,
   input: {},
   output: {},
   unlock: { RC100: 100_000 },
   lifeTime: 60,
   effect: "ProductionMultiplierBoost",
   range: AbilityRange.Adjacent,
};

export const HP1Booster: IBoosterDefinition = {
   ...BoosterDefenseProps,
   name: () => t(L.HP1Booster),
   desc: () => t(L.HP1BoosterDesc),
   code: CodeNumber.BT,
   buildingFlag: BuildingFlag.CanRotate | BuildingFlag.Booster,
   input: {},
   output: {},
   unlock: { AC130: 100_000 },
   lifeTime: 60,
   effect: "IncreaseMaxHpPct",
   range: AbilityRange.Adjacent,
};

export const DMG1Booster: IBoosterDefinition = {
   ...BoosterDefenseProps,
   name: () => t(L.DMG1Booster),
   desc: () => t(L.DMG1BoosterDesc),
   code: CodeNumber.BT,
   buildingFlag: BuildingFlag.CanRotate | BuildingFlag.Booster,
   input: {},
   output: {},
   unlock: { MS2: 100_000 },
   lifeTime: 60,
   effect: "IncreaseDamagePct",
   range: AbilityRange.Adjacent,
};

export const EVA1Booster: IBoosterDefinition = {
   ...BoosterDefenseProps,
   name: () => t(L.EVS1Booster),
   desc: () => t(L.EVS1BoosterDesc),
   code: CodeNumber.BT,
   buildingFlag: BuildingFlag.CanRotate | BuildingFlag.Booster,
   input: {},
   output: {},
   unlock: { LA1: 100_000 },
   lifeTime: 60,
   effect: "IncreaseEvasion",
   range: AbilityRange.Adjacent,
};
