import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { GridSize, tileToPosCenter } from "@spaceship-idle/shared/src/game/Grid";
import type { ITileData } from "@spaceship-idle/shared/src/game/ITileData";
import { RuntimeFlag } from "@spaceship-idle/shared/src/game/logic/RuntimeFlag";
import { isEnemy } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { clamp, formatNumber, hasFlag, lookAt, type Tile, type ValueOf } from "@spaceship-idle/shared/src/utils/Helper";
import type { Disposable } from "@spaceship-idle/shared/src/utils/TypedEvent";
import {
   BitmapText,
   type ColorSource,
   Container,
   Graphics,
   type IDestroyOptions,
   NineSlicePlane,
   Sprite,
} from "pixi.js";
import { Fonts } from "../assets";
import type { Action } from "../utils/actions/Action";
import { runFunc, sequence, to } from "../utils/actions/Actions";
import { Easing } from "../utils/actions/Easing";
import { G } from "../utils/Global";
import { ShipScene } from "./ShipScene";

export const TileVisualFlag = {
   None: 0,
   Static: 1 << 0,
   FlipHorizontal: 1 << 1,
} as const;

export type TileVisualFlag = ValueOf<typeof TileVisualFlag>;

const AlphaNormal = 0.5;
const AlphaHighlight = 1;
const SpriteSize = 75;

export class TileVisual extends Container {
   private _sprite: Sprite;
   private _transform = { x: 0, y: 0, rotation: 0 };
   private _healthBar: NineSlicePlane;
   private _healthBarDamage: NineSlicePlane;
   private _floaterValue = 0;
   private _damageValue = 0;
   private _floaterTimer = 0;
   private _disposables: Disposable[] = [];
   private _bottomRightText: BitmapText;
   private _bottomLeftSprite: Sprite;
   private _isWorking = false;
   private _healthBarBg: Sprite;
   private _background: Sprite;
   private _buff: BitmapText;
   private _debuff: BitmapText;

   private _progressMask: Graphics;
   private _progressBg: Sprite;
   private _fireAction: Action | undefined;

   constructor(
      private _tile: Tile,
      public data: ITileData,
      flag: TileVisualFlag,
   ) {
      super();
      const texture = G.textures.get(`Building/${data.type}`);
      if (!texture) {
         console.error(`Texture not found for Building/${data.type}`, G.textures);
      }

      this._background = this.addChild(new Sprite(G.textures.get("Misc/FrameFilled")));
      this._background.position.set(-GridSize / 2, -GridSize / 2);
      this._background.alpha = AlphaNormal;

      this._sprite = this.addChild(new Sprite(texture));
      this._sprite.position.set(0, 0);
      this._sprite.anchor.set(0.5);
      this._sprite.width = SpriteSize;
      this._sprite.height = SpriteSize;

      this._sprite.rotation += hasFlag(flag, TileVisualFlag.FlipHorizontal) ? Math.PI * 1.5 : Math.PI * 0.5;

      this._healthBarBg = this.addChild(new Sprite(G.textures.get("Misc/HealthBar")));
      this._healthBarBg.tint = 0x000000;
      this._healthBarBg.alpha = 0.7;
      this._healthBarBg.anchor.set(0, 0);
      this._healthBarBg.position.set(-40, -41);
      this._healthBarBg.width = 80;

      this._healthBarDamage = this._healthBarBg.addChild(
         new NineSlicePlane(G.textures.get("Misc/HealthBar")!, 4, 0, 4, 0),
      );
      this._healthBarDamage.width = 80;
      this._healthBarDamage.tint = 0xffeaa7;

      this._healthBar = this._healthBarBg.addChild(new NineSlicePlane(G.textures.get("Misc/HealthBar")!, 4, 0, 4, 0));
      this._healthBar.width = 80;
      this._healthBar.tint = isEnemy(this._tile) ? 0xe74c3c : 0x2ecc71;

      this._buff = this.addChild(
         new BitmapText("", {
            fontName: Fonts.SpaceshipIdleBold,
            fontSize: 18,
            tint: 0x7bed9f,
         }),
      );
      this._buff.anchor.set(0, 1);
      this._buff.position.set(-40, -18);
      this._buff.visible = false;

      this._debuff = this.addChild(
         new BitmapText("", {
            fontName: Fonts.SpaceshipIdleBold,
            fontSize: 18,
            tint: 0xff7675,
         }),
      );
      this._debuff.anchor.set(1, 1);
      this._debuff.position.set(40, -18);
      this._debuff.visible = false;

      this._bottomRightText = this.addChild(
         new BitmapText(this.levelLabel, {
            fontName: Fonts.SpaceshipIdleBold,
            fontSize: 18,
            tint: 0xffffff,
         }),
      );

      this._bottomRightText.anchor.set(1, 1);
      this._bottomRightText.position.set(41, 39);

      this._bottomLeftSprite = this.addChild(new Sprite());
      this._bottomLeftSprite.width = 16;
      this._bottomLeftSprite.height = 16;
      this._bottomLeftSprite.anchor.set(0, 1);
      this._bottomLeftSprite.position.set(-40, 40);

      this._disposables.push(GameOptionUpdated.on(this.onGameOptionUpdated.bind(this)));
      this._disposables.push(GameStateUpdated.on(this.onGameStateUpdated.bind(this)));

      this._progressBg = this.addChild(new Sprite(G.textures.get("Misc/FrameFilled")));
      this._progressBg.anchor.set(0.5);
      this._progressBg.tint = 0x000000;
      this._progressBg.alpha = 0.4;
      this._progressMask = this.addChild(new Graphics());
      this._progressBg.mask = this._progressMask;

      if (hasFlag(flag, TileVisualFlag.Static)) {
         this._healthBarBg.visible = false;
         this._healthBar.visible = false;
         this._background.visible = false;
      } else {
         this.alpha = 0;
         to<Container>(this, { alpha: 1 }, 0.25, Easing.OutSine).start();
      }
   }

   override destroy(options?: IDestroyOptions | boolean): void {
      this._disposables.forEach((d) => {
         d.dispose();
      });
      this._disposables = [];
      super.destroy(options);
   }

   private get levelLabel(): string {
      return String(this.data.level);
   }

   private onGameOptionUpdated(): void {}

   public get tint(): ColorSource {
      return this._sprite.tint;
   }

   public toggleHighlight(highlight: boolean): void {
      this._background.alpha = highlight ? AlphaHighlight : AlphaNormal;
   }

   private onGameStateUpdated(): void {
      this._bottomRightText.text = this.levelLabel;
      const rs = G.runtime.get(this._tile);
      if (rs) {
         this._isWorking = !hasFlag(rs.props.runtimeFlag, RuntimeFlag.Blackout);
      } else {
         this._isWorking = false;
      }

      if (!this._isWorking) {
         this._bottomLeftSprite.visible = true;
         this._bottomLeftSprite.texture = G.textures.get("Status/NoFire")!;
      } else if (rs?.addon) {
         this._bottomLeftSprite.visible = true;
         this._bottomLeftSprite.texture = G.textures.get(`Addon/${rs.addon.type}`)!;
      } else {
         this._bottomLeftSprite.visible = false;
      }
   }

   public update(dt: number) {
      this.progress += dt;
      if (this._isWorking) {
         this._sprite.alpha = clamp(this._sprite.alpha + dt, 0.5, 1);
      } else {
         this._sprite.alpha = clamp(this._sprite.alpha - dt, 0.5, 1);
      }

      if (!this._isWorking) {
         this._bottomLeftSprite.alpha = 0.5 * (Math.sin(0.005 * G.pixi.ticker.lastTime) + 1);
      } else {
         this._bottomLeftSprite.alpha = 1;
      }

      const rs = G.runtime.get(this._tile);
      if (rs) {
         this._healthBar.width = 80 * (1 - rs.damageTaken / rs.props.hp);
         if (rs.buff > 0) {
            this._buff.visible = true;
            this._buff.text = formatNumber(rs.buff);
         } else {
            this._buff.visible = false;
         }
         if (rs.debuff > 0) {
            this._debuff.visible = true;
            this._debuff.text = formatNumber(rs.debuff);
         } else {
            this._debuff.visible = false;
         }
      }

      this._floaterTimer += dt;
      if (this._floaterTimer >= G.speed) {
         this._floaterTimer = 0;
         this._flushFloater();
      }
   }

   public updateStatusEffect(buff: number, debuff: number): void {
      if (buff > 0) {
         this._buff.visible = true;
         this._buff.text = formatNumber(buff);
      } else {
         this._buff.visible = false;
      }
      if (debuff > 0) {
         this._debuff.visible = true;
         this._debuff.text = formatNumber(debuff);
      } else {
         this._debuff.visible = false;
      }
   }

   public addFloater(value: number): void {
      this._floaterValue += value;
   }

   public addDamage(value: number): void {
      this._damageValue += value;
   }

   private _flushFloater(): void {
      if (this._floaterValue > 0) {
         const t = ShipScene.TooltipPool.allocate();
         t.text = `+${formatNumber(this._floaterValue)}`;
         this._floaterValue = 0;
         t.tint = 0xffffff;
         t.alpha = 0;
         t.anchor.set(0.5, 1);
         t.x = this.x;
         t.y = this.y + 50;
         sequence(
            to(t, { y: t.y - 10, alpha: 1 }, 0.25, Easing.OutQuad),
            to(t, { y: t.y - 40, alpha: 0 }, 1.25, Easing.InQuad),
            runFunc(() => {
               ShipScene.TooltipPool.release(t);
            }),
         ).start();
      }
      if (this._damageValue !== 0) {
         const t = ShipScene.TooltipPool.allocate();
         t.text = `${this._damageValue >= 0 ? "-" : "+"}${formatNumber(Math.abs(this._damageValue))}`;
         t.tint = this._damageValue > 0 ? 0xe74c3c : 0x2ecc71;
         this._damageValue = 0;
         t.alpha = 0;
         t.anchor.set(0.5, 0.5);
         t.x = this.x;
         t.y = this.y - 30;
         sequence(
            to(t, { y: t.y - 10, alpha: 1 }, 0.25, Easing.OutQuad),
            to(t, { y: t.y - 50, alpha: 0 }, 1.25, Easing.InQuad),
            runFunc(() => {
               ShipScene.TooltipPool.release(t);
            }),
         ).start();
      }
      to(this._healthBarDamage, { width: this._healthBar.width }, 0.25, Easing.InQuad).start();
   }

   fire(target: Tile): void {
      const targetPos = tileToPosCenter(target);
      this._transform.x = this.x;
      this._transform.y = this.y;
      lookAt(this._transform, targetPos);
      this._sprite.rotation = this._transform.rotation;
      this._sprite.width = SpriteSize;
      this._sprite.height = SpriteSize;

      if (hasFlag(G.save.options.flag, GameOptionFlag.DisableWeaponFireAnimation)) {
         return;
      }

      if (!this._fireAction) {
         // this._fireAction = sequence(
         //    to(
         //       this._sprite,
         //       {
         //          x: -getForward(this._sprite.rotation).x * 5,
         //          y: -getForward(this._sprite.rotation).y * 5,
         //       },
         //       FireBackDuration,
         //       Easing.OutQuad,
         //    ),
         //    to(this._sprite, { x: 0, y: 0 }, FireForwardDuration, Easing.InOutQuad),
         // );
         this._fireAction = sequence(
            to(
               this._sprite,
               {
                  width: SpriteSize * 1.2,
                  height: SpriteSize * 1.2,
               },
               0.2,
               Easing.InQuad,
            ),
            to(
               this._sprite,
               {
                  width: SpriteSize,
                  height: SpriteSize,
               },
               0.2,
               Easing.OutQuad,
            ),
         );
      } else {
         this._fireAction.reset();
      }
      this._fireAction.start();
   }

   public set progress(value: number) {
      if (value <= 0) {
         this._progressMask.visible = false;
         return;
      }
      if (hasFlag(G.save.options.flag, GameOptionFlag.LinearCooldownIndicator)) {
         this.linearProgress(value);
      } else {
         this.radialProgress(value);
      }
   }

   private linearProgress(value: number) {
      this._progressMask.visible = true;
      this._progressMask.clear();
      this._progressMask.beginFill(0xffffff);
      const y = -value * 90 + 45;
      this._progressMask.moveTo(-45, y);
      this._progressMask.lineTo(45, y);
      this._progressMask.lineTo(45, -45);
      this._progressMask.lineTo(-45, -45);
      this._progressMask.endFill();
   }

   private radialProgress(value: number) {
      this._progressMask.visible = true;
      const toAngle = Math.PI * 2 * clamp(value, 0, 1) - Math.PI / 2;
      const fromAngle = 0 - Math.PI / 2;
      const radius = 45 * 1.5;
      const x1 = Math.cos(fromAngle) * radius;
      const y1 = Math.sin(fromAngle) * radius;
      const x2 = Math.cos(toAngle) * radius;
      const y2 = Math.sin(toAngle) * radius;
      this._progressMask.clear();
      this._progressMask.beginFill(0xffffff);
      this._progressMask.moveTo(0, 0);
      this._progressMask.lineTo(x1, y1);
      this._progressMask.lineTo(-radius, y1);
      if (x2 > 0) {
         this._progressMask.lineTo(-radius, radius);
         this._progressMask.lineTo(radius, radius);
      }
      this._progressMask.lineTo(x2 < 0 ? -radius : radius, y1);
      this._progressMask.lineTo(x2 < 0 ? -radius : radius, y2);
      this._progressMask.lineTo(x2, y2);
      this._progressMask.lineTo(0, 0);
      this._progressMask.endFill();
   }
}
