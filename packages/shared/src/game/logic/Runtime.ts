import { clamp, setFlag, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import { TypedEvent } from "../../utils/TypedEvent";
import { Config } from "../Config";
import { Blueprints } from "../definitions/Blueprints";
import { Bonus } from "../definitions/Bonus";
import { DamageType } from "../definitions/BuildingProps";
import {
   BattleTickInterval,
   ProductionTickInterval,
   SuddenDeathSeconds,
   SuddenDeathUndamagedSec,
} from "../definitions/Constant";
import { ProjectileFlag } from "../definitions/ProjectileFlag";
import { ShipClass } from "../definitions/ShipClass";
import {
   type GameState,
   GameStateUpdated,
   hashGameStatePair,
   type SaveGame,
   StopWarpCondition,
   type Tiles,
} from "../GameState";
import { tickAddon } from "./AddonLogic";
import { showInfo } from "./AlertLogic";
import type { BattleInfo } from "./BattleInfo";
import { generateShip, tickProjectiles, tickTiles } from "./BattleLogic";
import { BattleStatus } from "./BattleStatus";
import { BattleType } from "./BattleType";
import { tickCatalyst } from "./CatalystLogic";
import { tickGalaxy } from "./GalaxyLogic";
import type { Projectile } from "./Projectile";
import { getShipClassElementLevel, tickQuantumElementProgress } from "./QuantumElementLogic";
import { addResource, addStat, getStat, trySpendResource } from "./ResourceLogic";
import { RuntimeFlag } from "./RuntimeFlag";
import { RuntimeStat } from "./RuntimeStat";
import { RuntimeTile } from "./RuntimeTile";
import { flipHorizontalCopy, isEnemy } from "./ShipLogic";
import { Side } from "./Side";
import { getShipClass, getTechName } from "./TechLogic";

interface IBattleStatusChanged {
   prevStatus: BattleStatus;
   status: BattleStatus;
}

export const OnBattleStatusChanged = new TypedEvent<IBattleStatusChanged>();

export class Runtime {
   id = 0;
   battleSeconds = 0;
   battleTimer = BattleTickInterval;
   productionTimer = ProductionTickInterval;
   gameStateUpdateTimer = ProductionTickInterval;
   gameStateDirty = false;

   leftProjectiles = new Map<number, Projectile>();
   rightProjectiles = new Map<number, Projectile>();
   tiles = new Map<Tile, RuntimeTile>();

   leftStat = new RuntimeStat();
   rightStat = new RuntimeStat();

   scheduled: { action: () => void; second: number }[] = [];
   random: () => number;

   battleInfo: BattleInfo = {};
   battleType: BattleType = BattleType.Peace;
   battleStatus = BattleStatus.InProgress;

   public readonly left: GameState;
   public readonly right: GameState;
   public readonly original: { left: GameState; right: GameState };
   public readonly leftSave: SaveGame;

   constructor(left: SaveGame, right: GameState) {
      this.leftSave = left;
      this.left = left.state;
      this.right = flipHorizontalCopy(right);
      this.original = { left: structuredClone(this.left), right: structuredClone(this.right) };

      const hash = hashGameStatePair(this.left, this.right);
      this.random = srand(hash.toString());
   }

   public get(tile: Tile): RuntimeTile | undefined {
      const rs = this.tiles.get(tile);
      if (rs) {
         return rs;
      }
      const data = this.left.tiles.get(tile) || this.right.tiles.get(tile);
      if (data) {
         const newRs = new RuntimeTile(tile, data, this);
         this.tiles.set(tile, newRs);
         return newRs;
      }
      return undefined;
   }

   public createXPTarget(): void {
      if (this.right.tiles.size > 0) {
         console.error("createXPTarget called when there are still enemy tiles left");
         return;
      }
      this.tiles.forEach((tile) => {
         tile.target = undefined;
         if (!this.left.tiles.has(tile.tile)) {
            this.expire(tile.tile);
         }
      });

      const ship = generateShip(
         getShipClass(this.left),
         getShipClassElementLevel(getShipClass(this.left), this.left),
         Math.random,
      );

      Object.assign(this.right, flipHorizontalCopy(ship));
      this.rightStat = new RuntimeStat();
      this.markWreckage(this.right.tiles.keys());
   }

   public markWreckage(tiles: Iterable<Tile>): void {
      for (const tile of tiles) {
         const rs = this.get(tile);
         if (rs) {
            rs.props.runtimeFlag = setFlag(rs.props.runtimeFlag, RuntimeFlag.NoFire);
            rs.addStatusEffect("Wreckage", tile, rs.data.type, 1, Number.POSITIVE_INFINITY);
         }
      }
   }

   public has(tile: Tile): boolean {
      return this.tiles.has(tile);
   }

   expire(tile: Tile): void {
      this.tiles.delete(tile);
   }

   delete(tile: Tile): void {
      this.left.tiles.delete(tile);
      this.right.tiles.delete(tile);
      this.tiles.delete(tile);
   }

   destroy(tile: Tile): void {
      const rs = this.get(tile);
      if (!rs) return;
      rs.onDestroyed();
      if (isEnemy(tile)) {
         this.rightStat.destroyedHp += rs.props.hp;
      } else {
         this.leftStat.destroyedHp += rs.props.hp;
      }
      this.delete(tile);
   }

   public getGameState(tile: Tile): { state: GameState; side: Side } | null {
      if (this.left.tiles.has(tile)) {
         return { state: this.left, side: Side.Left };
      }
      if (this.right.tiles.has(tile)) {
         return { state: this.right, side: Side.Right };
      }
      return null;
   }

   public schedule(action: () => void, second: number): void {
      if (second === 0) {
         action();
      } else {
         this.scheduled.push({ action, second });
      }
   }

   public emit<T>(event: TypedEvent<T>, arg: T): void {
      if (this.battleInfo.silent) return;
      event.emit(arg);
   }

   public tick(dt: number, g: { speed: number }): void {
      if (this.gameStateDirty && this.gameStateUpdateTimer >= ProductionTickInterval) {
         this.gameStateDirty = false;
         this.gameStateUpdateTimer = 0;
         this.emit(GameStateUpdated, undefined);
      }
      while (this.productionTimer >= ProductionTickInterval) {
         this.productionTimer -= ProductionTickInterval;
         this._checkSpeed(g);
         this._prepareForTick();
         this._tickMultipliers();
         if (this.battleType === BattleType.Peace) {
            tickGalaxy(this);
            tickQuantumElementProgress(this.leftSave, this.battleInfo.silent);
         }
         this._tickDirectives();
         this._tickStatusEffect();
         this._checkSuddenDeath();
         this._tickPenalty();
         this._tickExtraXP();
         this._tickVictoryPointTimer();

         this.leftStat.tabulate(this.left, this);
         this.rightStat.tabulate(this.right, this);

         if (this.battleType === BattleType.Peace) {
            ++this.leftSave.data.tick;
            this.leftSave.data.seconds += 1 / g.speed;
         } else {
            ++this.battleSeconds;
            const prevStatus = this.battleStatus;
            const newStatus = this.getBattleStatus();
            this.battleStatus = newStatus;
            if (prevStatus !== newStatus) {
               this.emit(GameStateUpdated, undefined);
               this.emit(OnBattleStatusChanged, { status: newStatus, prevStatus });
            }
         }
         this.gameStateDirty = true;
      }
      while (this.battleTimer >= BattleTickInterval) {
         this.battleTimer -= BattleTickInterval;
         this._tickBattle();
      }
      this.gameStateUpdateTimer += g.speed === 0 ? 0 : dt / g.speed;
      this.productionTimer += dt;
      this.battleTimer += dt;
   }

   private _prepareForTick() {
      this.tiles.forEach((rs) => {
         rs.prepareForTick();
      });
      this.leftStat.prepareForTick();
      this.rightStat.prepareForTick();
   }

   private _tickPenalty() {
      const change = this.leftStat.warmongerDecrease.value;
      const current = getStat("Warmonger", this.left.stats);
      const min = this.leftStat.warmongerMin.value;
      if (current > min) {
         addStat("Warmonger", -Math.min(current - min, change), this.left.stats);
      }
   }

   private _tickDirectives(): void {
      this.left.selectedDirectives.forEach((boost, shipClass) => {
         Bonus[boost].onTick?.(Number.POSITIVE_INFINITY, t(L.XClassDirective, ShipClass[shipClass].name()), this);
      });
      Blueprints[this.left.blueprint].tick?.(this);
   }

   private _checkSpeed(g: { speed: number }) {
      if (this.battleType !== BattleType.Peace) {
         return;
      }
      if (
         this.leftSave.data.stopWarpCondition === StopWarpCondition.Zero &&
         getStat("Warmonger", this.left.stats) <= 0
      ) {
         this.leftSave.data.stopWarpCondition = StopWarpCondition.Never;
         g.speed = 1;
         return;
      }
      if (
         this.leftSave.data.stopWarpCondition === StopWarpCondition.Minimum &&
         getStat("Warmonger", this.left.stats) <= this.leftStat.warmongerMin.value
      ) {
         this.leftSave.data.stopWarpCondition = StopWarpCondition.Never;
         g.speed = 1;
         return;
      }
      const cost = (g.speed - 1) / g.speed;
      if (cost > 0) {
         if (trySpendResource("Warp", cost, this.left.resources)) {
            return;
         }
         g.speed = 1;
      }
   }

   private _tickBattle(): void {
      tickTiles(Side.Left, this.left, this.right, this.rightProjectiles, this.leftStat, this);
      tickTiles(Side.Right, this.right, this.left, this.leftProjectiles, this.rightStat, this);
      tickProjectiles(Side.Left, this.leftProjectiles, this.left, this);
      tickProjectiles(Side.Right, this.rightProjectiles, this.right, this);

      this.scheduled = this.scheduled.filter((s) => {
         s.second -= BattleTickInterval;
         if (s.second <= 0) {
            s.action();
            return false;
         }
         return true;
      });

      if (this.battleType === BattleType.Peace) {
         if (this.right.tiles.size === 0) {
            this.createXPTarget();
         }
         return;
      }
   }

   private _tickExtraXP(): void {
      addResource(
         "XP",
         this.leftStat.extraXPPerSecond.value * this.totalXPPerSecond(this.left.tiles),
         this.left.resources,
      );
   }

   private _tickVictoryPointTimer(): void {
      const vp = this.leftStat.victoryPointPerHour.value;
      if (vp > 0) {
         while (getStat("VictoryPointTimer", this.left.stats) >= 60 * 60) {
            addStat("VictoryPointTimer", -60 * 60, this.left.stats);
            addResource("VictoryPoint", vp, this.left.resources);
            showInfo(t(L.VictoryPointHasBeenAddToYourShip, vp), true);
         }
         addStat("VictoryPointTimer", 1, this.left.stats);
      } else {
         this.left.stats.set("VictoryPointTimer", 0);
      }
   }

   public totalXPPerSecond(tiles: Tiles): number {
      let total = 0;
      tiles.forEach((_data, tile) => {
         const rs = this.get(tile);
         if (rs) {
            total += rs.xpPerSecond;
         }
      });
      return total;
   }

   public totalDealtDamage(): [number, number] {
      let left = 0;
      let right = 0;
      this.left.tiles.forEach((_data, tile) => {
         const rs = this.get(tile);
         if (rs) {
            left += rs.damageTaken;
         }
      });
      this.right.tiles.forEach((_data, tile) => {
         const rs = this.get(tile);
         if (rs) {
            right += rs.damageTaken;
         }
      });
      // Damaged dealt is the opposite of damage taken, so we swap left and right
      return [right + this.rightStat.destroyedHp, left + this.leftStat.destroyedHp];
   }

   private _tickStatusEffect(): void {
      for (const [key, val] of this.tiles) {
         val.tickStatusEffect();
         if (val.isDead) {
            this.destroy(key);
         }
      }
   }

   private _tickMultipliers(): void {
      this.tiles.forEach((rs) => {
         const result = this.getGameState(rs.tile);
         if (!result) return;

         const { state, side } = result;

         state.unlockedTech.forEach((tech) => {
            const def = Config.Tech[tech];
            const multipliers = def?.multiplier?.[rs.data.type];
            if (!multipliers) {
               return;
            }
            if (multipliers.hp) {
               rs.hpMultiplier.add(multipliers.hp, t(L.SourceResearchX, getTechName(tech)));
            }
            if (multipliers.damage) {
               rs.damageMultiplier.add(multipliers.damage, t(L.SourceResearchX, getTechName(tech)));
            }
         });
         const element = Config.Buildings[rs.data.type].element;
         if (element) {
            const thisRun = state.elements.get(element) ?? 0;
            if (thisRun) {
               if (thisRun.hp > 0) {
                  rs.hpMultiplier.add(thisRun.hp, t(L.ElementAmountThisRun, element));
               }
               if (thisRun.damage > 0) {
                  rs.damageMultiplier.add(thisRun.damage, t(L.ElementAmountThisRun, element));
               }
            }
            const permanent = state.permanentElements.get(element);
            if (permanent) {
               if (permanent.hp > 0) {
                  rs.hpMultiplier.add(permanent.hp, t(L.ElementPermanent, element));
               }
               if (permanent.damage > 0) {
                  rs.damageMultiplier.add(permanent.damage, t(L.ElementPermanent, element));
               }
            }
         }
      });
      tickCatalyst(this.left, this.leftStat, this);
      tickCatalyst(this.right, this.rightStat, this);
      tickAddon(this.left, this);
      tickAddon(this.right, this);
   }

   private _checkSuddenDeath(): void {
      if (this.battleType === BattleType.Peace) {
         return;
      }

      if (this.battleInfo.noSuddenDeath) {
         return;
      }

      const leftDamage = this.suddenDeathDamage(Side.Left);
      if (leftDamage > 0) {
         this.left.tiles.forEach((_data, tile) => {
            this.get(tile)?.takeDamage(leftDamage, DamageType.Kinetic, ProjectileFlag.None, null);
            this.get(tile)?.takeDamage(leftDamage, DamageType.Explosive, ProjectileFlag.None, null);
            this.get(tile)?.takeDamage(leftDamage, DamageType.Energy, ProjectileFlag.None, null);
         });
      }

      const rightDamage = this.suddenDeathDamage(Side.Right);
      if (rightDamage > 0) {
         this.right.tiles.forEach((_data, tile) => {
            this.get(tile)?.takeDamage(rightDamage, DamageType.Kinetic, ProjectileFlag.None, null);
            this.get(tile)?.takeDamage(rightDamage, DamageType.Explosive, ProjectileFlag.None, null);
            this.get(tile)?.takeDamage(rightDamage, DamageType.Energy, ProjectileFlag.None, null);
         });
      }
   }

   public suddenDeathDamage(side: Side): number {
      if (side === Side.Left) {
         const damage = Math.max(
            Math.floor(this.leftStat.zeroProjectileSec - SuddenDeathUndamagedSec),
            this.battleSeconds - SuddenDeathSeconds,
         );
         return clamp(damage, 0, Number.POSITIVE_INFINITY) ** 2;
      }
      if (side === Side.Right) {
         const damage = Math.max(
            Math.floor(this.rightStat.zeroProjectileSec - SuddenDeathUndamagedSec),
            this.battleSeconds - SuddenDeathSeconds,
         );
         return clamp(damage, 0, Number.POSITIVE_INFINITY) ** 2;
      }
      return 0;
   }

   private getBattleStatus(): BattleStatus {
      if (this.left.tiles.size === 0 && this.right.tiles.size > 0) {
         return BattleStatus.RightWin;
      }
      if (this.left.tiles.size > 0 && this.right.tiles.size === 0) {
         return BattleStatus.LeftWin;
      }
      if (this.left.tiles.size === 0 && this.right.tiles.size === 0) {
         return BattleStatus.Draw;
      }
      if (this.battleType === BattleType.Peace) {
         return BattleStatus.InProgress;
      }
      return BattleStatus.InProgress;
   }
}
