import { Image, type ImageProps } from "@mantine/core";
import { hashGameState, type GameState } from "@spaceship-idle/shared/src/game/GameState";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { LRUCache } from "@spaceship-idle/shared/src/utils/LRUCache";
import { useEffect, useRef } from "react";
import { ShipImage } from "../scenes/ShipImage";
import { G } from "../utils/Global";

const _leftCache = new LRUCache<bigint, Blob>(100);
const _rightCache = new LRUCache<bigint, Blob>(100);

function getCache(side: Side): LRUCache<bigint, Blob> {
   return side === Side.Left ? _leftCache : _rightCache;
}

export function ShipImageComp({ ship, side, ...props }: ImageProps & { ship: GameState; side: Side }): React.ReactNode {
   const image = useRef<HTMLImageElement>(null);
   useEffect(() => {
      const cache = getCache(side);
      const hash = hashGameState(ship);
      const cached = cache.get(hash);
      if (image.current && cached) {
         image.current.src = URL.createObjectURL(cached);
         return;
      }

      const shipImage = new ShipImage(ship, side);
      const canvas = G.pixi.renderer.extract.canvas(shipImage);
      canvas.toBlob?.((blob) => {
         if (image.current && blob) {
            cache.set(hash, blob);
            image.current.src = URL.createObjectURL(blob);
            shipImage.destroy({ children: true });
         } else {
            console.error("Failed to generate image for ship");
         }
      }, "image/png");
   }, [ship, side]);
   return <Image ref={image} {...props} />;
}
