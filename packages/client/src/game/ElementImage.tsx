import { Image, type ImageProps } from "@mantine/core";
import type { ElementSymbol } from "@spaceship-idle/shared/src/game/PeriodicTable";
import type { Application } from "pixi.js";
import { useEffect, useRef } from "react";
import { ElementCard } from "../scenes/ElementCard";
import { G } from "../utils/Global";

const elementImages = new Map<string, Blob>();

export function getElementImage(app: Application, symbol: ElementSymbol, color: number): Promise<Blob> {
   const key = `${symbol}:${color}`;
   const cached = elementImages.get(key);
   if (cached) {
      return Promise.resolve(cached);
   }
   return new Promise((resolve, reject) => {
      const card = new ElementCard(symbol, color, 1);
      const canvas = app.renderer.extract.canvas(card);
      canvas.toBlob?.((blob) => {
         if (blob) {
            elementImages.set(key, blob);
            resolve(blob);
         } else {
            reject(new Error(`Failed to generate image for ${symbol}`));
         }
      }, "image/png");
   });
}

export function ElementImageComp({
   symbol,
   color,
   ...props
}: ImageProps & { symbol: ElementSymbol; color: number }): React.ReactNode {
   const image = useRef<HTMLImageElement>(null);
   useEffect(() => {
      getElementImage(G.pixi, symbol, color).then((blob) => {
         if (image.current && blob) {
            image.current.src = URL.createObjectURL(blob);
         }
      });
   }, [symbol, color]);
   return <Image ref={image} {...props} />;
}
