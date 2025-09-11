import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { GridSize, tileToPos } from "@spaceship-idle/shared/src/game/Grid";
import { calculateAABB, flipHorizontalCopy } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { createTile, tileToPoint } from "@spaceship-idle/shared/src/utils/Helper";
import { Container, Sprite } from "pixi.js";
import { G } from "../utils/Global";
import { TileVisual, TileVisualFlag } from "./TileVisual";

export class ShipImage extends Container {
   constructor(ship: GameState, side: Side) {
      super();
      const tiles = side === Side.Right ? flipHorizontalCopy(ship).tiles : ship.tiles;
      const aabb = calculateAABB(tiles.keys());
      tiles.forEach((data, tile) => {
         const { x, y } = tileToPoint(tile);
         const pos = tileToPos(createTile(x - aabb.min.x, y - aabb.min.y));
         const frame = this.addChild(new Sprite(G.textures.get("Misc/Frame")));
         // 0.5 will cause rendering artifacts - what can I say?
         frame.alpha = 0.51;
         frame.tint = 0xffffff;
         let flag = TileVisualFlag.Static;
         if (side === Side.Right) {
            flag |= TileVisualFlag.FlipHorizontal;
         }
         const visual = this.addChild(new TileVisual(tile, data, flag));
         frame.position.set(pos.x, pos.y);
         visual.position.set(pos.x + GridSize / 2, pos.y + GridSize / 2);
      });
   }
}
