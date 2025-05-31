import { type Shortcut, isShortcutEqual, makeShortcut } from "@spaceship-idle/shared/src/game/Shortcut";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { G } from "./Global";

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
         const config = G.save.options.shortcuts[shortcut];
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
