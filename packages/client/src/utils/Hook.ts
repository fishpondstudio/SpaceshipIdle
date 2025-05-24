import type { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useEffect, useReducer, useState } from "react";

export function makeObservableHook<T, K>(event: TypedEvent<T>, getter: (param: K) => T) {
   return function observe(param: K): T {
      const [_, setter] = useState(0);
      function handleEvent(data: T): void {
         setter((old) => old + 1);
      }
      // biome-ignore lint/correctness/useExhaustiveDependencies(handleEvent):
      useEffect(() => {
         event.on(handleEvent);
         return () => {
            event.off(handleEvent);
         };
      }, [event]);
      return getter(param);
   };
}

export function useTypedEvent<T>(event: TypedEvent<T>, listener: (e: T) => void) {
   return useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, [event, listener]);
}

const reducer = (value: number) => (value + 1) % 1000000;

export function refreshOnTypedEvent<T>(event: TypedEvent<T>): number {
   const [handle, update] = useReducer(reducer, 0);
   function listener() {
      update();
   }
   // biome-ignore lint/correctness/useExhaustiveDependencies(listener):
   useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, [event]);
   return handle;
}
