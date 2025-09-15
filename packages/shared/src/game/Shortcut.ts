import { L, t } from "../utils/i18n";

export interface IShortcutConfig {
   key: string;
   ctrl: boolean;
   alt: boolean;
   shift: boolean;
   meta: boolean;
}

export function getShortcutKey(s: IShortcutConfig): string {
   const keys: string[] = [];
   if (s.key === "") {
      return "";
   }
   if (s.ctrl) {
      keys.push("Ctrl");
   }
   if (s.shift) {
      keys.push("Shift");
   }
   if (s.alt) {
      keys.push("Alt");
   }
   if (s.meta) {
      keys.push("Command");
   }

   if (s.key === " ") {
      keys.push("Space");
   } else {
      keys.push(s.key);
   }

   return keys.join(" + ").toUpperCase();
}

export function isShortcutEqual(a: IShortcutConfig, b: IShortcutConfig): boolean {
   return (
      a.ctrl === b.ctrl &&
      a.shift === b.shift &&
      a.alt === b.alt &&
      a.meta === b.meta &&
      a.key.toUpperCase() === b.key.toUpperCase()
   );
}

export function makeShortcut(e: {
   ctrlKey: boolean;
   shiftKey: boolean;
   altKey: boolean;
   metaKey: boolean;
   key: string;
}): IShortcutConfig {
   return {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
      key: e.key,
   };
}

export const Shortcut = {
   Upgrade1: () => t(L.ShortcutUpgrade1),
   Downgrade1: () => t(L.ShortcutDowngrade1),
   Upgrade5: () => t(L.ShortcutUpgrade5),
   Downgrade5: () => t(L.ShortcutDowngrade5),
   Upgrade10: () => t(L.ShortcutUpgrade10),
   Downgrade10: () => t(L.ShortcutDowngrade10),
   UpgradeMax: () => t(L.ShortcutUpgradeMax),
   Recycle: () => t(L.ShortcutRecycle),
} as const satisfies Record<string, () => string>;

export type Shortcut = keyof typeof Shortcut;
