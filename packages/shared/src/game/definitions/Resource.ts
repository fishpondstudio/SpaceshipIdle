import { L, t } from "../../utils/i18n";

export interface IResourceDefinition {
   name: () => string;
}

export const Resources = {
   Ti: {
      name: () => t(L.Ti),
   },
   U: {
      name: () => t(L.Uranium),
   },
   Power: {
      name: () => t(L.Power),
   },
   AC30: {
      name: () => t(L.AC30Ammo),
   },
   AC30F: {
      name: () => t(L.AC30FAmmo),
   },
   AC30x3: {
      name: () => t(L.AC30x3Ammo),
   },
   AC76: {
      name: () => t(L.AC76Ammo),
   },
   AC76R: {
      name: () => t(L.AC76RAmmo),
   },
   AC130: {
      name: () => t(L.AC130Ammo),
   },
   AC130E: {
      name: () => t(L.AC130EAmmo),
   },
   H: {
      name: () => t(L.Hydrogen),
   },
   Rocket: {
      name: () => t(L.Rocket),
   },
   Circuit: {
      name: () => t(L.Circuit),
   },
   D2: {
      name: () => t(L.D2),
   },
   Si: {
      name: () => t(L.Si),
   },
   XP: {
      name: () => t(L.XP),
   },
   MS1: {
      name: () => t(L.MS1Ammo),
   },
   MS1H: {
      name: () => t(L.MS1HAmmo),
   },
   MS2: {
      name: () => t(L.MS2Ammo),
   },
   MS2R: {
      name: () => t(L.MS2RAmmo),
   },
   MS1F: {
      name: () => t(L.MS1FAmmo),
   },
   MS3: {
      name: () => t(L.MS3Ammo),
   },
   LA1: {
      name: () => t(L.LA1Ammo),
   },
   AC30S: {
      name: () => t(L.AC30SAmmo),
   },
   AC130S: {
      name: () => t(L.AC130SAmmo),
   },
   AC130C: {
      name: () => t(L.AC130CAmmo),
   },
   MS2C: {
      name: () => t(L.MS2CAmmo),
   },
   MS2S: {
      name: () => t(L.MS2SAmmo),
   },
   AC76x2: {
      name: () => t(L.AC76x2Ammo),
   },
   AC76D: {
      name: () => t(L.AC76DAmmo),
   },
   RC50: {
      name: () => t(L.RC50Ammo),
   },
   RC100: {
      name: () => t(L.RC100Ammo),
   },
   RC50E: {
      name: () => t(L.RC50EAmmo),
   },
   RC100G: {
      name: () => t(L.RC100GAmmo),
   },
   RC100P: {
      name: () => t(L.RC100PAmmo),
   },
   LA1E: {
      name: () => t(L.LA1EAmmo),
   },
   Antimatter: {
      name: () => t(L.Antimatter),
   },
   Warp: {
      name: () => t(L.TimeWarp),
   },
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
