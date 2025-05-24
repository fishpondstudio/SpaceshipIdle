import version from "../version.json";
import { PatchNotes } from "./PatchNotes";

export function getVersion(): string {
   return `${PatchNotes[0].version}.${version.build}`;
}

export function getBuildNumber(): number {
   return version.build;
}
