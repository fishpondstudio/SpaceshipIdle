import version from "../version.json";

const ver = "0.1";

export function getVersion(): string {
   return `${ver}.${version.build}`;
}

export function getBuildNumber(): number {
   return version.build;
}
