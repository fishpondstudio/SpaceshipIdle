import { L, t } from "../../utils/i18n";
import { AbilityRange } from "./Ability";
import { BoosterDefenseProps, BuildingFlag, type IBoosterDefinition } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const HP1Booster: IBoosterDefinition = {
   ...BoosterDefenseProps,
   name: () => t(L.HP1Booster),
   desc: () => t(L.HP1BoosterDesc),
   code: CodeNumber.BT,
   buildingFlag: BuildingFlag.CanRotate | BuildingFlag.Booster,
   unlock: { XP: 100_000 },
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
   unlock: { XP: 100_000 },
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
   unlock: { XP: 100_000 },
   lifeTime: 60,
   effect: "IncreaseEvasion",
   range: AbilityRange.Adjacent,
};
