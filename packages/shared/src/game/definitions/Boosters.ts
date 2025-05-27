import { L, t } from "../../utils/i18n";
import { boostTarget } from "./Ability";
import { BoosterDefenseProps, BoostRange, BuildingFlag, type IBoosterDefinition } from "./BuildingProps";
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
   tick: (self, rs, rt) => {
      boostTarget(rs.tile, self.range, rt).forEach((target) => {
         if (target === rs.tile) return;
         rt.get(target)?.addStatusEffect("ProductionMultiplierBoost", rs.tile, rs.data.type, 1, 0);
      });
   },
   range: BoostRange.Adjacent,
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
   tick: (self, rs, rt) => {
      boostTarget(rs.tile, self.range, rt).forEach((target) => {
         if (target === rs.tile) return;
         rt.get(target)?.addStatusEffect("IncreaseMaxHpPct", rs.tile, rs.data.type, 1, 0);
      });
   },
   range: BoostRange.Adjacent,
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
   tick: (self, rs, rt) => {
      boostTarget(rs.tile, self.range, rt).forEach((target) => {
         if (target === rs.tile) return;
         rt.get(target)?.addStatusEffect("IncreaseDamagePct", rs.tile, rs.data.type, 1, 0);
      });
   },
   range: BoostRange.Adjacent,
};

export const EVA1Booster: IBoosterDefinition = {
   ...BoosterDefenseProps,
   name: () => t(L.EVA1Booster),
   desc: () => t(L.EVA1BoosterDesc),
   code: CodeNumber.BT,
   buildingFlag: BuildingFlag.CanRotate | BuildingFlag.Booster,
   input: {},
   output: {},
   unlock: { LA1: 100_000 },
   tick: (self, rs, rt) => {
      boostTarget(rs.tile, self.range, rt).forEach((target) => {
         if (target === rs.tile) return;
         rt.get(target)?.addStatusEffect("IncreaseEvasion", rs.tile, rs.data.type, 1, 0);
      });
   },
   range: BoostRange.Adjacent,
};
