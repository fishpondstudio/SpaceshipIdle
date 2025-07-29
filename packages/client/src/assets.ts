import SpaceshipIdlePixel from "./assets/fonts/ari-w9500-display.ttf";
import SpaceshipIdleBold from "./assets/fonts/Farro-Bold.ttf";
import SpaceshipIdle from "./assets/fonts/Farro-Medium.ttf";
import Monospace from "./assets/fonts/MartianMono-Medium.ttf";

export const Fonts = {
   SpaceshipIdle: "SpaceshipIdle",
   SpaceshipIdlePixel: "SpaceshipIdlePixel",
   SpaceshipIdleBold: "SpaceshipIdleBold",
   SpaceshipIdleMono: "SpaceshipIdleMono",
} as const;

export const FontFaces = [
   new FontFace(Fonts.SpaceshipIdle, `url("${SpaceshipIdle}")`, { weight: "normal" }),
   new FontFace(Fonts.SpaceshipIdle, `url("${SpaceshipIdleBold}")`, { weight: "bold" }),
   new FontFace(Fonts.SpaceshipIdleMono, `url("${Monospace}")`, { weight: "normal" }),
   new FontFace(Fonts.SpaceshipIdlePixel, `url("${SpaceshipIdlePixel}")`, { weight: "normal" }),
];
