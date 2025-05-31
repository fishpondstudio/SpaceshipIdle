import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { G } from "./Global";

document.addEventListener("keydown", (e) => {
   if (e.target instanceof HTMLInputElement) {
      return;
   }
   //    forEach(getGameOptions().shortcuts, (shortcut, config) => {
   //       if (isShortcutEqual(config, makeShortcut(e))) {
   //          shortcuts[shortcut]?.();
   //       }
   //    });
});

export interface IShortcutConfig {
   key: string;
   ctrl: boolean;
   alt: boolean;
   shift: boolean;
   meta: boolean;
}

export function getShortcutKey(s: IShortcutConfig): string {
   const keys: string[] = [];
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

export function makeShortcut(e: KeyboardEvent): IShortcutConfig {
   return {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
      key: e.key,
   };
}

export const Shortcut = {
   Upgrade1: () => "",
} as const satisfies Record<string, () => string>;

export type Shortcut = keyof typeof Shortcut;

export const useShortcut = (shortcut: Shortcut, callback: (event: KeyboardEvent) => void) => {
   const callbackRef = useRef(callback);
   useLayoutEffect(() => {
      callbackRef.current = callback;
   });

   const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
         const isTextInput =
            event.target instanceof HTMLTextAreaElement ||
            (event.target instanceof HTMLInputElement && (!event.target.type || event.target.type === "text")) ||
            (event.target as HTMLElement).isContentEditable;
         if (isTextInput) {
            return;
         }
         const config = G.save.options.shortcuts.get(shortcut);
         if (!config) {
            return;
         }
         if (isShortcutEqual(config, makeShortcut(event))) {
            callbackRef.current(event);
         }
      },
      [shortcut],
   );

   useEffect(() => {
      window.addEventListener("keydown", handleKeyDown);

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
      };
   }, [handleKeyDown]);
};
