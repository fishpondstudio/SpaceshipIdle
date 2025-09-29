import type { Tile } from "../../utils/Helper";
import { type IHaveXY, Vector2 } from "../../utils/Vector2";
import type { Ability } from "../definitions/Ability";
import type { DamageType, ProjectileFlag } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { tileToPosCenter } from "../Grid";
import type { Multipliers } from "./IMultiplier";

export class Projectile {
   private length: number;
   public dir: IHaveXY;
   public pos: IHaveXY;
   public time = 0;
   public readonly hit = new Set<Tile>();
   from: IHaveXY;
   to: IHaveXY;

   constructor(
      public readonly fromTile: Tile,
      public readonly toTile: Tile,
      public readonly damage: number,
      public readonly building: Building,
      public readonly level: number,
      public readonly damageType: DamageType,
      public readonly projectileSpeed: number,
      public readonly flag: ProjectileFlag,
      public readonly critical: boolean,
      public readonly multipliers: Required<Multipliers>,
      public readonly ability: Ability | undefined,
      private mag: number,
   ) {
      this.from = tileToPosCenter(fromTile);
      this.to = tileToPosCenter(toTile);
      const dx = this.to.x - this.from.x;
      const dy = this.to.y - this.from.y;
      this.length = Vector2.length({ x: dx, y: dy });
      this.dir = { x: 0, y: 0 };
      this.pos = { x: 0, y: 0 };
   }

   public position(inputTime?: number): IHaveXY {
      const time = inputTime ?? this.time;
      const t = time / (this.length / this.projectileSpeed);

      const { x, y } = this._position(t);
      const { x: nextX, y: nextY } = this._position(t + 0.01);
      this.dir.x = nextX - x;
      this.dir.y = nextY - y;

      this.pos.x = x;
      this.pos.y = y;
      return this.pos;
   }

   private _position(t: number): IHaveXY {
      const x = (1 - t) * this.from.x + t * this.to.x;
      const y = (1 - t) * this.from.y + t * this.to.y;

      const dx = this.to.x - this.from.x;
      const dy = this.to.y - this.from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const perpX = -dy / length;
      const perpY = dx / length;

      const offset = this.mag * Math.sin(t * 2 * Math.PI);
      return { x: x + perpX * offset, y: y + perpY * offset };
   }
}
