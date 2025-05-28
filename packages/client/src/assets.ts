import Monospace from "./assets/fonts/DepartureMono-Regular.ttf";
import SpaceshipIdleBold from "./assets/fonts/Farro-Bold.ttf";
import SpaceshipIdle from "./assets/fonts/Farro-Medium.ttf";

export const Fonts = {
   SpaceshipIdle: "SpaceshipIdle",
   SpaceshipIdleBold: "SpaceshipIdleBold",
   SpaceshipIdleMono: "SpaceshipIdleMono",
} as const;

export const FontFaces = [
   new FontFace(Fonts.SpaceshipIdle, `url("${SpaceshipIdle}")`, { weight: "normal" }),
   new FontFace(Fonts.SpaceshipIdle, `url("${SpaceshipIdleBold}")`, { weight: "bold" }),
   new FontFace(Fonts.SpaceshipIdleMono, `url("${Monospace}")`, { weight: "normal" }),
];
