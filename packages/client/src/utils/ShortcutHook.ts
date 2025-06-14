import { type Shortcut, isShortcutEqual, makeShortcut } from "@spaceship-idle/shared/src/game/Shortcut";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { G } from "./Global";

const OnKeyDown = new TypedEvent<KeyboardEvent>();
window.addEventListener("keydown", OnKeyDown.emit);

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
      OnKeyDown.clear();
      const handle = OnKeyDown.on(handleKeyDown);
      return () => handle.dispose();
   }, [handleKeyDown]);
};
