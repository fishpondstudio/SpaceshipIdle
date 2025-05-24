import { type ImageProps, Image } from "@mantine/core";
import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import type { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { useEffect, useRef } from "react";
import { ShipImage } from "../scenes/ShipImage";
import { G } from "../utils/Global";

export function ShipImageComp({ ship, side, ...props }: ImageProps & { ship: GameState; side: Side }): React.ReactNode {
   const image = useRef<HTMLImageElement>(null);
   useEffect(() => {
      const shipImage = new ShipImage(ship, side);
      const canvas = G.pixi.renderer.extract.canvas(shipImage);
      canvas.toBlob?.((blob) => {
         if (image.current && blob) {
            image.current.src = URL.createObjectURL(blob);
            shipImage.destroy({ children: true });
         } else {
            console.error("Failed to generate image for ship");
         }
      }, "image/png");
   }, [ship, side]);
   return <Image ref={image} {...props} />;
}
