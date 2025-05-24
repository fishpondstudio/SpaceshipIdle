import { G } from "../../utils/Global";

export function TextureComp({
   name,
   size,
   ...attrs
}: { name: string; size: number } & React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
   const texture = G.textures.get(name);
   if (!texture) {
      return null;
   }
   const scale = size / texture.width;
   const { style, ...rest } = attrs;
   return (
      <div
         style={{
            ...style,
            backgroundImage: `url("${G.atlasUrl}")`,
            width: texture.width * scale,
            height: texture.height * scale,
            backgroundPosition: `-${texture.frame.x * scale}px -${texture.frame.y * scale}px`,
            backgroundSize: `${texture.baseTexture.width * scale}px ${texture.baseTexture.height * scale}px`,
         }}
         {...rest}
      ></div>
   );
}
