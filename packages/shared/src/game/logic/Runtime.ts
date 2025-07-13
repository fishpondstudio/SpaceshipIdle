import { clamp, createTile, hasFlag, mapSafeAdd, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import { TypedEvent } from "../../utils/TypedEvent";
import { Config } from "../Config";
import { DamageType, ProjectileFlag } from "../definitions/BuildingProps";
import {
   BattleTickInterval,
   MaxSuddenDeathTick,
   ProductionTickInterval,
   SuddenDeathUndamagedSec,
} from "../definitions/Constant";
import type { GameOption } from "../GameOption";
import { type GameState, GameStateUpdated, hashGameStatePair, type SaveGame, type Tiles } from "../GameState";
import { makeTile } from "../ITileData";
import { tickProjectiles, tickTiles } from "./BattleLogic";
import { BattleStatus } from "./BattleStatus";
import { BattleFlag, BattleType } from "./BattleType";
import { tickElement } from "./ElementLogic";
import type { Projectile } from "./Projectile";
import { getQualifiedQuantum } from "./ResourceLogic";
import { RuntimeStat } from "./RuntimeStat";
import { RuntimeTile } from "./RuntimeTile";
import { flipHorizontal, isEnemy, shipAABB } from "./ShipLogic";
import { Side } from "./Side";
import { getTechName } from "./TechLogic";

interface IBattleStatusChanged {
   prevStatus: BattleStatus;
   status: BattleStatus;
}

export const OnBattleStatusChanged = new TypedEvent<IBattleStatusChanged>();

export class Runtime {
   id = 0;
   productionTick = 0;
   wave = 0;
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

   battleFlag: BattleFlag = BattleFlag.None;
   battleType: BattleType = BattleType.Peace;
   battleStatus = BattleStatus.InProgress;

   public readonly left: GameState;
   public readonly right: GameState;
   public readonly leftOptions: GameOption;

   constructor(left: SaveGame, right: GameState) {
      this.left = left.current;
      // We clone the right because we will mutate it!
      this.right = structuredClone(right);
      this.right.tiles = flipHorizontal(this.right.tiles);

      this.leftOptions = left.options;

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
      const level = Math.floor(getQualifiedQuantum(this.left) / 10) + this.wave;
      if (this.right.tiles.size > 0) {
         console.error("createEnemy called when there are still enemy tiles left");
         return;
      }
      const aabb = shipAABB(1, Side.Left);
      this.tiles.forEach((tile) => {
         tile.target = undefined;
      });
      for (let y = aabb.min.y; y <= aabb.max.y; ++y) {
         for (let x = aabb.min.x; x <= aabb.max.x; ++x) {
            const tile = createTile(x, y);
            this.right.tiles.set(tile, makeTile("AC30", level));
         }
      }
      this.right.tiles = flipHorizontal(this.right.tiles);
      this.right.tiles.forEach((data, tile) => {
         this.get(tile)?.addStatusEffect("Disarm", tile, "AC30", 1, Number.POSITIVE_INFINITY);
      });
      this.rightStat = new RuntimeStat();
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

   public getGameState(tile: Tile): GameState | null {
      if (this.left.tiles.has(tile)) {
         return this.left;
      }
      if (this.right.tiles.has(tile)) {
         return this.right;
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
      if (hasFlag(this.battleFlag, BattleFlag.Silent)) return;
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
         this._tickMultipliers();
         this._tickStatusEffect();
         this._tickProduction();
         this._checkLifeTime();
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

   private _checkSpeed(g: { speed: number }) {
      if (this.battleType !== BattleType.Peace) {
         return;
      }
      const cost = (g.speed - 1) / g.speed;
      if (cost > 0) {
         if ((this.left.resources.get("Warp") ?? 0) >= cost) {
            mapSafeAdd(this.left.resources, "Warp", -cost);
         } else {
            g.speed = 1;
         }
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
            ++this.wave;
            this.createXPTarget();
         }
         return;
      }

      const prevStatus = this.battleStatus;
      const newStatus = this.checkBattleStatus();
      this.battleStatus = newStatus;
      if (prevStatus !== newStatus) {
         this.emit(GameStateUpdated, undefined);
         this.emit(OnBattleStatusChanged, { status: newStatus, prevStatus });
      }
   }

   public tabulateHp(tiles: Tiles): [number, number] {
      let hp = 0;
      let totalHp = 0;
      tiles.forEach((data, tile) => {
         const rs = this.get(tile);
         if (rs) {
            hp += rs.props.hp - rs.damageTaken;
            totalHp += rs.props.hp;
         }
      });
      return [hp, totalHp];
   }

   public totalDealtDamage(): [number, number] {
      let left = 0;
      let right = 0;
      this.left.tiles.forEach((data, tile) => {
         const rs = this.get(tile);
         if (rs) {
            left += rs.damageTaken;
         }
      });
      this.right.tiles.forEach((data, tile) => {
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
         rs.productionMultiplier.clear();
         rs.xpMultiplier.clear();
         rs.hpMultiplier.clear();
         rs.damageMultiplier.clear();

         const gs = this.getGameState(rs.tile);
         if (!gs) return;

         gs.unlockedTech.forEach((tech) => {
            const def = Config.Tech[tech];
            const multipliers = def?.multiplier?.[rs.data.type];
            if (!multipliers) {
               return;
            }
            if (multipliers.production) {
               rs.productionMultiplier.add(multipliers.production, t(L.ResearchX, getTechName(tech)));
            }
            if (multipliers.xp) {
               rs.xpMultiplier.add(multipliers.xp, t(L.ResearchX, getTechName(tech)));
            }
            if (multipliers.hp) {
               rs.hpMultiplier.add(multipliers.hp, t(L.ResearchX, getTechName(tech)));
            }
            if (multipliers.damage) {
               rs.damageMultiplier.add(multipliers.damage, t(L.ResearchX, getTechName(tech)));
            }
         });
         const element = Config.Buildings[rs.data.type].element;
         if (element) {
            const thisRun = gs.elements.get(element) ?? 0;
            if (thisRun > 0) {
               rs.productionMultiplier.add(thisRun, t(L.ElementAmountThisRun, element));
            }
            const permanent = gs.permanentElements.get(element)?.production ?? 0;
            if (permanent > 0) {
               rs.productionMultiplier.add(permanent, t(L.ElementPermanent, element));
            }
            const xp = gs.permanentElements.get(element)?.xp ?? 0;
            if (xp > 0) {
               rs.xpMultiplier.add(xp, t(L.ElementPermanent, element));
            }
         }
      });
   }

   private _tickProduction(): void {
      this.leftStat.tabulate(this);
      this.rightStat.tabulate(this);
      tickElement(this.left);
      ++this.productionTick;
   }

   private _checkLifeTime(): void {
      if (this.battleType === BattleType.Peace) {
         return;
      }
      this.tiles.forEach((rs) => {
         if (this.productionTick >= rs.props.lifeTime) {
            this.destroy(rs.tile);
         }
      });

      const leftDamage = this.suddenDeathDamage(Side.Left);
      if (leftDamage > 0) {
         this.left.tiles.forEach((data, tile) => {
            this.get(tile)?.takeDamage(leftDamage, DamageType.Kinetic, ProjectileFlag.None, null);
            this.get(tile)?.takeDamage(leftDamage, DamageType.Explosive, ProjectileFlag.None, null);
            this.get(tile)?.takeDamage(leftDamage, DamageType.Energy, ProjectileFlag.None, null);
         });
      }

      const rightDamage = this.suddenDeathDamage(Side.Right);
      if (rightDamage > 0) {
         this.right.tiles.forEach((data, tile) => {
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
            this.productionTick - MaxSuddenDeathTick,
         );
         return clamp(damage, 0, Number.POSITIVE_INFINITY) ** 2;
      }
      if (side === Side.Right) {
         const damage = Math.max(
            Math.floor(this.rightStat.zeroProjectileSec - SuddenDeathUndamagedSec),
            this.productionTick - MaxSuddenDeathTick,
         );
         return clamp(damage, 0, Number.POSITIVE_INFINITY) ** 2;
      }
      return 0;
   }

   private checkBattleStatus(): BattleStatus {
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
