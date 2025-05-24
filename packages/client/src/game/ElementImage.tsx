import { Image, type ImageProps } from "@mantine/core";
import type { ElementSymbol } from "@spaceship-idle/shared/src/game/PeriodicTable";
import type { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import { ElementCard } from "../scenes/ElementCard";
import { G } from "../utils/Global";

const elementImages = new Map<string, Blob>();

export function getElementImage(app: Application, symbol: ElementSymbol): Promise<Blob> {
   const cached = elementImages.get(symbol);
   if (cached) {
      return Promise.resolve(cached);
   }
   return new Promise((resolve, reject) => {
      const card = new ElementCard(symbol, 0xffffff, 1);
      const canvas = app.renderer.extract.canvas(card);
      canvas.toBlob?.((blob) => {
         if (blob) {
            elementImages.set(symbol, blob);
            resolve(blob);
         } else {
            reject(new Error(`Failed to generate image for ${symbol}`));
         }
      }, "image/png");
   });
}

export function ElementImageComp({ symbol, ...props }: ImageProps & { symbol: ElementSymbol }): React.ReactNode {
   const image = useRef<HTMLImageElement>(null);
   useEffect(() => {
      getElementImage(G.pixi, symbol).then((blob) => {
         if (image.current && blob) {
            image.current.src = URL.createObjectURL(blob);
         }
      });
   }, [symbol]);
   return <Image ref={image} {...props} />;
}
