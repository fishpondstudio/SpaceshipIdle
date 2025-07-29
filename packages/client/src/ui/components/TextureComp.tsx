import { PixelPerfect } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { G } from "../../utils/Global";

export function TextureComp({
   name,
   width,
   height,
   ...attrs
}: { name: string; width?: number; height?: number } & React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
   const texture = G.textures.get(name);
   if (!texture) {
      return null;
   }
   const scale = width ? width / texture.width : height ? height / texture.height : 1;
   const { style, ...rest } = attrs;
   return (
      <div
         style={{
            ...style,
            backgroundImage: `url("${G.atlasUrl.get(name)}")`,
            width: texture.width * scale,
            height: texture.height * scale,
            backgroundPosition: `-${texture.frame.x * scale}px -${texture.frame.y * scale}px`,
            backgroundSize: `${texture.baseTexture.width * scale}px ${texture.baseTexture.height * scale}px`,
            imageRendering: PixelPerfect ? "pixelated" : "auto",
         }}
         {...rest}
      ></div>
   );
}
