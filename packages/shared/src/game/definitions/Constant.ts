import { range } from "../../utils/Helper";

export const Version = "0.10";
export const PixelPerfect = true;
export const BattleTickInterval = 0.05;
export const ProductionTickInterval = 1;
export const ClientTickInterval = 5;
export const StatusEffectTickInterval = ProductionTickInterval;
export const GoldenRatio = (1 + Math.sqrt(5)) / 2;
export const QuantumToElement = 10;
export const BattleWinQuantum = 10;
export const BattleLossQuantum = 5;
export const DefaultElementChoices = 3;
export const LaserArrayDamagePct = 1 / range(1, 10).reduce((a, b) => a + 1 / b, 0);
export const DamageToHPMultiplier = 10;
export const BalanceVersion = 1;
export const SaveFileVersion = 2;
export const DefaultCooldown = 2;
export const CatalystPerCat = 3;
export const MaxBattleTick = 10 * 60;
export const SuddenDeathSeconds = 5 * 60;
export const SuddenDeathUndamagedSec = 10;
export const FriendshipDurationSeconds = 4 * 60 * 60;
export const FriendshipBaseCost = 1;
export const MaxBuildingCount = 1000;
export const MatchmakingMinimumQuantum = 20;
export const MatchmakingMinimumXP = 100_000;
export const ElementThisRunColor = 0x94a9cd;
export const ElementPermanentColor = 0xffeaa7;
export const BaseWarmongerChangePerSec = 0.001;
export const FireBackDuration = 0.1;
export const FireForwardDuration = 0.4;
export const DiscordUrl = "https://discord.com/invite/Z3kFpawyts";
export const SteamUrl = "https://store.steampowered.com/app/3454630?utm_source=InGame";
export const SteamUrlWebFTUE = "https://store.steampowered.com/app/3454630?utm_source=WebFTUE";
export const TranslationUrl = "https://github.com/fishpondstudio/SpaceshipIdle/tree/main/packages/shared/src/languages";
export const PatchNotesUrl =
   "https://store.steampowered.com/news/app/3454630?utm_source=InGame&utm_campaign=PatchNotes";
export const SentryDSN = "https://6f5a13f4c1574079879b80b722f6a26a@bugreport.fishpondstudio.com/3";

export const WarpElementId = "ship-info-warp";
export const XPElementId = "ship-info-xp";
export const VictoryPointElementId = "ship-info-victory-point";
export const AddonTabElementId = "bottom-panel-addon";
export const QuantumElementId = "ship-info-quantum";

export const CatalystTabElementId = "bottom-panel-catalyst";
export const ResearchTabElementId = "bottom-panel-research";
export const ElementTabElementId = "bottom-panel-element";
export const GalaxyTabElementId = "bottom-panel-galaxy";

export const DirectiveChoiceCount = 3;
export const ExploreCostPerLightYear = 5;

export const MaxShipClass = "Corvette";
export const BaseTimeWarpHour = 8;
