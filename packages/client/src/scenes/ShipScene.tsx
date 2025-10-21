import { computePosition, flip, offset, shift } from "@floating-ui/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { AbilityTiming, abilityTarget } from "@spaceship-idle/shared/src/game/definitions/Ability";
import { ProjectileFlag } from "@spaceship-idle/shared/src/game/definitions/ProjectileFlag";
import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated, type Tiles } from "@spaceship-idle/shared/src/game/GameState";
import {
   GridSize,
   getSize,
   MaxX,
   MaxY,
   posToTile,
   tileToPos,
   tileToPosCenter,
} from "@spaceship-idle/shared/src/game/Grid";
import { makeTile } from "@spaceship-idle/shared/src/game/ITileData";
import { showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import {
   OnDamaged,
   OnProjectileHit,
   OnWeaponFire,
   RequestFloater,
   RequestTextIndicator,
} from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getBuildingCost, getTotalBuildingCost } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import type { Projectile } from "@spaceship-idle/shared/src/game/logic/Projectile";
import { refundResource, trySpendResources } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import type { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { OnStatusEffectsChanged } from "@spaceship-idle/shared/src/game/logic/RuntimeTile";
import {
   getShipBlueprint,
   isEnemy,
   isShipConnected,
   isWithinShipExtent,
   shipAABB,
} from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { AABB } from "@spaceship-idle/shared/src/utils/AABB";
import {
   createTile,
   flatMapOf,
   hasFlag,
   lookAt,
   rand,
   shuffle,
   type Tile,
   tileToPoint,
} from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ObjectPool } from "@spaceship-idle/shared/src/utils/ObjectPool";
import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import {
   type ColorSource,
   Container,
   type FederatedPointerEvent,
   ParticleContainer,
   Sprite,
   TilingSprite,
} from "pixi.js";
import { Fonts } from "../assets";
import { BuildingPopover } from "../ui/BuildingPopover";
import { SetPopover } from "../ui/PopoverHelper";
import { setSidebar } from "../ui/Sidebar";
import { playClick, playError } from "../ui/Sound";
import { TilePage } from "../ui/TilePage";
import { delay, runFunc, sequence, to } from "../utils/actions/Actions";
import { Easing } from "../utils/actions/Easing";
import { G } from "../utils/Global";
import { destroyAllChildren, type ISceneContext, Scene } from "../utils/SceneManager";
import { UnicodeText } from "../utils/UnicodeText";
import { TileVisual, TileVisualFlag } from "./TileVisual";

const PaintMode = Number.parseInt(new URLSearchParams(location.href.split("?")[1]).get("paint") ?? "0");

export class ShipScene extends Scene {
   private _selectors: Map<Tile, Sprite> = new Map();
   private _targetIndicator: Sprite;
   private _tileVisuals: Map<Tile, TileVisual> = new Map();
   private _projectileVisuals: Map<number, Sprite> = new Map();
   private _tileContainer: Container;
   private _projectileContainer: Container;
   private _grid: Container;

   public static TooltipPool: ObjectPool<UnicodeText>;
   public static ShieldPool: ObjectPool<Sprite>;
   public static Explosion: ObjectPool<Sprite>;
   public static Selector: ObjectPool<Sprite>;
   private _selectedTiles: Set<Tile> = new Set();
   private _highlightedTiles: Set<Tile> = new Set();

   private _blueprintDirty = true;
   private _focusRequested = true;

   backgroundColor(): ColorSource {
      return 0x000000;
   }

   id(): string {
      return ShipScene.name;
   }

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = this.context;
      const { width, height } = getSize();

      const minZoom = Math.max(app.screen.width / width, app.screen.height / height);
      this.viewport.setWorldSize(width, height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.center = { x: width / 2, y: height / 2 };
      this.viewport.setWorldSize(width, height);

      ShipScene.TooltipPool = new ObjectPool<UnicodeText>({
         create: () => {
            const t = this.viewport.addChild(
               new UnicodeText("", { fontName: Fonts.SpaceshipIdleBold, fontSize: 18, tint: 0xffffff }),
            );
            return t;
         },
         onAllocate: (t) => {
            t.visible = true;
         },
         onRelease: (t) => {
            t.visible = false;
         },
      });

      ShipScene.ShieldPool = new ObjectPool<Sprite>({
         create: () => {
            const t = this.viewport.addChild(new Sprite(G.textures.get("Misc/Shield")));
            t.anchor.set(0.5, 0.5);
            return t;
         },
         onAllocate: (t) => {
            t.visible = true;
         },
         onRelease: (t) => {
            t.visible = false;
         },
      });

      ShipScene.Explosion = new ObjectPool<Sprite>({
         create: () => {
            const t = this.viewport.addChild(new Sprite(G.textures.get("Others/Particle")));
            t.anchor.set(0.5, 0.5);
            return t;
         },
         onAllocate: (t) => {
            t.visible = true;
         },
         onRelease: (t) => {
            t.visible = false;
         },
      });

      ShipScene.Selector = new ObjectPool<Sprite>({
         create: () => {
            const sprite = this.viewport.addChild(new Sprite(G.textures.get("Misc/FrameSelected")));
            return sprite;
         },
         onAllocate: (t) => {
            t.visible = true;
         },
         onRelease: (t) => {
            t.visible = false;
         },
      });

      this._grid = this.viewport.addChild(new Container());
      this._tileContainer = this.viewport.addChild(new Container());
      this._projectileContainer = this.viewport.addChild(
         new ParticleContainer(10000, {
            position: true,
            rotation: true,
            alpha: true,
         }),
      );
      this.viewport.addChild(new TilingSprite(textures.get("Misc/Frame")!, width, height)).alpha = 0.15;
      this._targetIndicator = this.viewport.addChild(new Sprite(G.textures.get("Misc/TargetIndicator")));
      this._targetIndicator.anchor.set(0.5, 0.5);
      this._targetIndicator.tint = 0xe74c3c;
      this._targetIndicator.visible = false;
      this._targetIndicator.name = "TargetIndicator";

      RequestFloater.on(({ tile, amount }) => {
         if (hasFlag(G.save.options.flag, GameOptionFlag.HideXPText)) {
            return;
         }
         this._tileVisuals.get(tile)?.addFloater(amount);
      });

      OnDamaged.on(({ tile, amount }) => {
         this._tileVisuals.get(tile)?.addDamage(amount);
      });

      RequestTextIndicator.on(({ tile, text, tint }) => {
         const tooltip = ShipScene.TooltipPool.allocate();
         tooltip.text = text;
         tooltip.tint = tint;
         tooltip.alpha = 0.5;
         tooltip.anchor.set(0.5, 0.5);
         tooltip.scale.set(1, 1);
         tooltip.position = tileToPosCenter(tile);
         sequence(
            to(tooltip, { scale: { x: 1.5, y: 1.5 }, alpha: 1 }, 0.5, Easing.OutCubic),
            delay(0.25),
            to(tooltip, { scale: { x: 2, y: 2 }, alpha: 0 }, 0.25, Easing.InCubic),
            runFunc(() => {
               tooltip.scale.set(1, 1);
               ShipScene.TooltipPool.release(tooltip);
            }),
         ).start();
      });

      OnProjectileHit.on(({ position, tile }) => {
         const visual = this._tileVisuals.get(tile);
         if (visual) {
            const shield = ShipScene.ShieldPool.allocate();
            shield.position = tileToPosCenter(tile);
            lookAt(shield, position);
            shield.alpha = 0;
            sequence(
               to(shield, { alpha: 0.5 }, 0.1, Easing.OutQuad),
               to(shield, { alpha: 0 }, 0.25, Easing.InQuad),
               runFunc(() => {
                  ShipScene.ShieldPool.release(shield);
               }),
            ).start();
         }
      });

      OnWeaponFire.on(({ from, to }) => {
         this._tileVisuals.get(from)?.fire(to);
      });

      OnStatusEffectsChanged.on(({ tile, buff, debuff }) => {
         this._tileVisuals.get(tile)?.updateStatusEffect(buff, debuff);
      });
   }

   private explode(pos: IHaveXY, tint: ColorSource): void {
      for (let i = 0; i < 64; i++) {
         const particle = ShipScene.Explosion.allocate();
         particle.position = pos;
         particle.scale.set(rand(1, 2));
         particle.alpha = rand(0.5, 1);
         particle.tint = tint;
         sequence(
            to(
               particle,
               {
                  alpha: 0,
                  x: pos.x + rand(-100, 100),
                  y: pos.y + rand(-100, 100),
                  scale: {
                     x: rand(0.1, 0.5),
                     y: rand(0.1, 0.5),
                  },
               },
               rand(0.5, 1),
               Easing.OutQuad,
            ),
            runFunc(() => {
               ShipScene.Explosion.release(particle);
            }),
         ).start();
      }
   }

   public render(rt: Runtime, dt: number, timeSinceLastTick: number): void {
      this.renderBlueprint();

      this.renderTiles(rt.left.tiles, rt, dt, timeSinceLastTick);
      this.renderTiles(rt.right.tiles, rt, dt, timeSinceLastTick);

      this._tileVisuals.forEach((visual, tile) => {
         if (!rt.left.tiles.has(tile) && !rt.right.tiles.has(tile)) {
            visual.destroy({ children: true, baseTexture: false });
            this._tileVisuals.delete(tile);
            if ((dt > 0 && rt.battleType !== BattleType.Peace) || isEnemy(tile)) {
               this.explode(tileToPosCenter(tile), visual.tint);
            }
         }
      });

      this.drawProjectiles(rt.leftProjectiles, dt, timeSinceLastTick);
      this.drawProjectiles(rt.rightProjectiles, dt, timeSinceLastTick);

      this._projectileVisuals.forEach((visual, id) => {
         if (!rt.leftProjectiles.has(id) && !rt.rightProjectiles.has(id)) {
            visual.destroy({ children: true, baseTexture: false });
            this._projectileVisuals.delete(id);
         }
      });

      this._targetIndicator.visible = false;
      if (this._selectedTiles.size === 1) {
         for (const tile of this._selectedTiles) {
            const rs = rt.get(tile);
            if (rs?.target && rt.has(rs.target)) {
               const pos = tileToPosCenter(rs.target);
               this._targetIndicator.position.set(pos.x, pos.y);
               this._targetIndicator.visible = true;
               break;
            }
         }
      }

      if (this._focusRequested) {
         this._focusRequested = false;
         this.viewport.center = { x: this.viewport.worldWidth / 2, y: this.viewport.worldHeight / 2 };
         const aabb = AABB.fromPoints(
            Array.from(rt.left.tiles.keys()).concat(Array.from(rt.right.tiles.keys())).map(tileToPosCenter),
         );
         aabb.extendBy({ x: aabb.width * 0.25, y: aabb.height * 0.25 }, aabb);
         this.viewport.zoom = Math.min(
            this.viewport.screenWidth / aabb.width,
            this.viewport.screenHeight / aabb.height,
            1,
         );
         this._selectedTiles.clear();
         this._selectedTiles.add(createTile(MaxX / 2 - 2, MaxY / 2));
         this.updateSelection();
      }
   }

   private renderTiles(tiles: Tiles, rt: Runtime, dt: number, timeSinceLastTick: number): void {
      tiles.forEach((data, tile) => {
         const pos = tileToPos(tile);
         let visual = this._tileVisuals.get(tile);
         if (visual && visual.data !== data) {
            this._tileVisuals.delete(tile);
            visual.destroy({ children: true, baseTexture: false });
            visual = undefined;
         }
         if (!visual) {
            let flag = TileVisualFlag.None;
            if (isEnemy(tile)) {
               flag |= TileVisualFlag.FlipHorizontal;
            }
            visual = this._tileContainer.addChild(new TileVisual(tile, data, flag));
            this._tileVisuals.set(tile, visual);
            visual.position.set(pos.x + GridSize / 2, pos.y + GridSize / 2);
         }
         visual.update(dt);
         visual.toggleHighlight(this._highlightedTiles.has(tile));

         const rs = rt.get(tile);
         const showCooldownIndicator =
            rt.battleType !== BattleType.Peace ||
            hasFlag(G.save.options.flag, GameOptionFlag.CooldownIndicatorOutsideBattle);

         if (rs && rs.props.fireCooldown > 0 && showCooldownIndicator) {
            visual.progress = (rs.cooldown + timeSinceLastTick) / rs.props.fireCooldown;
         } else {
            visual.progress = 0;
         }
      });
   }

   private renderBlueprint(): void {
      if (PaintMode) {
         if (!this._blueprintDirty) {
            return;
         }
         this._blueprintDirty = false;
         destroyAllChildren(this._grid);
         const meAABB = shipAABB(PaintMode, Side.Left);
         for (let y = meAABB.min.y; y <= meAABB.max.y; y++) {
            for (let x = meAABB.min.x; x <= meAABB.max.x; x++) {
               const s = this._grid.addChild(new Sprite(this.context.textures.get("Misc/Frame")));
               s.position.set(x * GridSize, y * GridSize);
               s.alpha = 0.35;
            }
         }
      } else {
         if (!this._blueprintDirty) {
            return;
         }
         this._blueprintDirty = false;
         destroyAllChildren(this._grid);
         getShipBlueprint(G.save.state).forEach((tile) => {
            const s = this._grid.addChild(new Sprite(this.context.textures.get("Misc/Frame")));
            const { x, y } = tileToPoint(tile);
            s.position.set(x * GridSize, y * GridSize);
            s.alpha = 0.35;
         });
      }
   }

   private drawProjectiles(projectiles: Map<number, Projectile>, dt: number, timeSinceLastTick: number): void {
      projectiles.forEach((projectile, id) => {
         let visual = this._projectileVisuals.get(id);
         if (!visual) {
            visual = this._projectileContainer.addChild(
               new Sprite(
                  G.textures.get(`Projectile/${projectile.building}`) ??
                     G.textures.get(`Projectile/${Config.Buildings[projectile.building].code}`),
               ),
            );
            this._projectileVisuals.set(id, visual);
         }
         const pos = projectile.position(projectile.time + timeSinceLastTick);
         visual.position.set(pos.x, pos.y);
         visual.anchor.set(0.5, 0.5);
         visual.alpha = 0.75;
         visual.width = 32;
         visual.height = 32;
         if (hasFlag(projectile.flag, ProjectileFlag.DroneDamage)) {
            visual.rotation += dt * Math.PI * 4;
         } else {
            visual.rotation = Math.atan2(projectile.dir.y, projectile.dir.x) + Math.PI / 2;
         }
      });
   }

   public requestBlueprintUpdate(): void {
      this._blueprintDirty = true;
   }

   public requestFocus(): void {
      this._focusRequested = true;
   }

   override onClicked(e: FederatedPointerEvent): void {
      playClick();
      const pos = this.viewport.screenToWorld(e.screen);
      const clickedTile = posToTile(pos);

      if (PaintMode && (e.button === 1 || e.button === 2)) {
         // Middle click

         const buildings = flatMapOf(Config.Tech, (tech, def) => def.unlockBuildings ?? []);
         shuffle(buildings);

         if (e.button === 1) {
            G.save.state.tiles.set(clickedTile, makeTile(buildings[0], 1));
            const point = tileToPoint(clickedTile);
            G.save.state.tiles.set(createTile(point.x, MaxY - 1 - point.y), makeTile(buildings[1], 1));
         }
         // Right click
         if (e.button === 2) {
            G.save.state.tiles.delete(clickedTile);
            const point = tileToPoint(clickedTile);
            G.save.state.tiles.delete(createTile(point.x, MaxY - 1 - point.y));
         }
         console.log(G.save.state.tiles.size);
         console.log(JSON.stringify(Array.from(G.save.state.tiles.keys())));
         return;
      }

      // Middle click copy
      if (e.button === 1) {
         if (
            !G.save.state.tiles.has(clickedTile) &&
            !this._selectedTiles.has(clickedTile) &&
            this._selectedTiles.size === 1
         ) {
            if (!isWithinShipExtent(clickedTile, G.save.state)) {
               playError();
               showError(t(L.NotWithinExtent));
               return;
            }
            for (const oldTile of this._selectedTiles) {
               const tiles = new Set(G.save.state.tiles.keys());
               tiles.add(clickedTile);
               if (!isShipConnected(tiles)) {
                  playError();
                  showError(t(L.NotConnected));
                  return;
               }
               const oldTileData = G.save.state.tiles.get(oldTile);
               if (oldTileData) {
                  if (
                     trySpendResources({ XP: getBuildingCost(oldTileData.type, 1), Quantum: 1 }, G.save.state.resources)
                  ) {
                     G.save.state.tiles.set(clickedTile, makeTile(oldTileData.type, 1));
                     GameStateUpdated.emit();
                  } else {
                     playError();
                     showError(t(L.NotEnoughResources));
                     return;
                  }
               }
               break;
            }
         }
         return;
      }

      if (e.button === 2) {
         // Right click swap
         if (!this._selectedTiles.has(clickedTile) && this._selectedTiles.size === 1) {
            if (!isWithinShipExtent(clickedTile, G.save.state)) {
               playError();
               showError(t(L.NotWithinExtent));
               return;
            }
            for (const oldTile of this._selectedTiles) {
               const clickedTileData = G.save.state.tiles.get(clickedTile);
               if (!clickedTileData) {
                  const tiles = new Set(G.save.state.tiles.keys());
                  tiles.add(clickedTile);
                  tiles.delete(oldTile);
                  if (!isShipConnected(tiles)) {
                     playError();
                     showError(t(L.NotConnected));
                     return;
                  }
               }
               const oldTileData = G.save.state.tiles.get(oldTile);
               if (oldTileData) {
                  G.save.state.tiles.set(clickedTile, oldTileData);
                  if (clickedTileData) {
                     G.save.state.tiles.set(oldTile, clickedTileData);
                  } else {
                     G.save.state.tiles.delete(oldTile);
                  }
                  G.runtime.expire(oldTile);
                  G.runtime.expire(clickedTile);
                  this._selectedTiles.clear();
                  this._selectedTiles.add(clickedTile);
                  this.updateSelection();
                  GameStateUpdated.emit();
               }
               break;
            }
            return;
         }
         const data = G.save.state.tiles.get(clickedTile);
         // Right click delete
         if (data) {
            const tiles = new Set(G.save.state.tiles.keys());
            tiles.delete(clickedTile);
            if (!isShipConnected(tiles)) {
               playError();
               showError(t(L.NotConnected));
               return;
            }
            G.runtime.delete(clickedTile);
            refundResource("Quantum", 1, G.save.state.resources);
            refundResource("XP", getTotalBuildingCost(data.type, data.level, 0), G.save.state.resources);
            GameStateUpdated.emit();
         }
         return;
      }

      if (e.shiftKey && this._selectedTiles.size > 0) {
         const p = tileToPoint(clickedTile);
         let minX = p.x;
         let maxX = p.x;
         let minY = p.y;
         let maxY = p.y;

         this._selectedTiles.forEach((tile) => {
            const point = tileToPoint(tile);
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
         });

         for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
               const t = createTile(x, y);
               this._selectedTiles.add(t);
            }
         }

         this.updateSelection();
         return;
      }

      const data = G.runtime.get(clickedTile)?.data;
      if (data && e.detail === 2) {
         this._selectedTiles.clear();
         for (const [tile, tileData] of G.save.state.tiles) {
            if (tileData.type === data.type) {
               this._selectedTiles.add(tile);
            }
         }
         this.updateSelection();
         return;
      }

      if (!e.ctrlKey || !G.save.state.tiles.has(clickedTile)) {
         this._selectedTiles.clear();
      }

      if (this._selectedTiles.has(clickedTile) && this._selectedTiles.size > 1) {
         this._selectedTiles.delete(clickedTile);
      } else {
         this._selectedTiles.add(clickedTile);
      }

      this.updateSelection(clickedTile);
   }

   public selectTiles(tiles: Iterable<Tile>): void {
      this._selectedTiles.clear();
      for (const tile of tiles) {
         this._selectedTiles.add(tile);
      }
      this.updateSelection();
   }

   private updateSelection(clickedTile?: Tile): void {
      this._highlightedTiles.clear();
      this._selectedTiles.forEach((tile) => {
         if (!this._selectors.has(tile)) {
            const selector = ShipScene.Selector.allocate();
            selector.position.set(tileToPos(tile).x, tileToPos(tile).y);
            selector.alpha = 0;
            sequence(to(selector, { alpha: 1 }, 0.25, Easing.OutQuad)).start();
            this._selectors.set(tile, selector);
         }
         if (this._selectedTiles.size === 1) {
            const tileData = G.save.state.tiles.get(tile);
            if (tileData && !isEnemy(tile)) {
               const def = Config.Buildings[tileData.type];
               if ("ability" in def && def.ability && def.ability.timing === AbilityTiming.OnFire) {
                  abilityTarget(Side.Left, def.ability.range, tile, G.save.state.tiles).forEach((highlight) => {
                     this._highlightedTiles.add(highlight);
                  });
               }
            }
         }
      });

      for (const tile of this._selectedTiles) {
         const tileData = G.save.state.tiles.get(tile);
         console.log(tile, tileData);
         break;
      }

      this._selectors.forEach((sprite, tile) => {
         if (!this._selectedTiles.has(tile)) {
            this._selectors.delete(tile);
            sequence(
               to(sprite, { alpha: 0 }, 0.25, Easing.OutQuad),
               runFunc(() => {
                  ShipScene.Selector.release(sprite);
               }),
            ).start();
         }
      });

      if (G.runtime.battleType === BattleType.Peace) {
         setSidebar(<TilePage selectedTiles={this._selectedTiles} />);
      } else {
         if (
            clickedTile &&
            this._selectedTiles.size === 1 &&
            this._selectedTiles.has(clickedTile) &&
            G.runtime.has(clickedTile)
         ) {
            const posTopLeft = tileToPos(clickedTile);
            const posBottomRight = { x: posTopLeft.x + GridSize, y: posTopLeft.y + GridSize };
            const posTopLeftScreen = this.viewport.worldToScreen(posTopLeft);
            const posBottomRightScreen = this.viewport.worldToScreen(posBottomRight);
            const referenceEl = {
               x: posTopLeftScreen.x,
               y: posTopLeftScreen.y,
               width: posBottomRightScreen.x - posTopLeftScreen.x,
               height: posBottomRightScreen.y - posTopLeftScreen.y,
            };
            const floatingEl = { x: 0, y: 0, width: 300, height: 400 };
            computePosition(referenceEl, floatingEl, {
               platform: {
                  getElementRects: (data) => data,
                  getClippingRect: () => ({
                     x: 50,
                     y: 50,
                     width: window.innerWidth - 100,
                     height: window.innerHeight - 100,
                  }),
                  getDimensions: (element) => element,
               },
               middleware: [offset(10), flip(), shift()],
               placement: "right-start",
            }).then((data) => {
               const result = G.runtime.getGameState(clickedTile);
               if (result) {
                  SetPopover.emit({
                     rect: AABB.fromRect({
                        x: data.x,
                        y: data.y,
                        width: floatingEl.width,
                        height: floatingEl.height,
                     }),
                     content: <BuildingPopover tile={clickedTile} gs={result.state} />,
                  });
               } else {
                  SetPopover.emit(undefined);
               }
            });
         } else {
            SetPopover.emit(undefined);
         }
      }
   }
}
