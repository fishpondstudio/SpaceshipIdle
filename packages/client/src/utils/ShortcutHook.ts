import { isShortcutEqual, makeShortcut, type Shortcut } from "@spaceship-idle/shared/src/game/Shortcut";
import { forEach } from "@spaceship-idle/shared/src/utils/Helper";
import { type DependencyList, useEffect } from "react";
import { G } from "./Global";

window.addEventListener("keydown", (e) => {
   const isTextInput =
      e.target instanceof HTMLTextAreaElement ||
      (e.target instanceof HTMLInputElement && (!e.target.type || e.target.type === "text")) ||
      (e.target as HTMLElement).isContentEditable;
   if (isTextInput) {
      return;
   }
   const shortcut = makeShortcut(e);

   forEach(G.save.options.shortcuts, (key, config) => {
      if (isShortcutEqual(config, shortcut)) {
         const callback = shortcuts.get(key);
         if (callback) {
            callback(e);
         }
      }
   });
});

export const shortcuts = new Map<Shortcut, (event: KeyboardEvent) => void>();

export const useShortcut = (shortcut: Shortcut, callback: (event: KeyboardEvent) => void, deps: DependencyList) => {
   useEffect(() => {
      shortcuts.set(shortcut, callback);
      return () => {
         shortcuts.delete(shortcut);
      };
   }, [shortcut, callback, ...deps]);
};
