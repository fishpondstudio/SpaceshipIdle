import { Version } from "@spaceship-idle/shared/src/game/definitions/Constant";
import version from "../version.json";

export function getVersion(): string {
   return `${Version}.${version.build}`;
}

export function getBuildNumber(): number {
   return version.build;
}
