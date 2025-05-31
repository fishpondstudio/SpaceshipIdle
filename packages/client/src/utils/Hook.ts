import type { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useEffect, useReducer } from "react";

export function makeObservableHook<T, K>(event: TypedEvent<T>, getter: (param: K) => T) {
   return function observe(param: K): T {
      const [_, update] = useReducer(reducer, 0);
      useEffect(() => {
         event.on(update);
         return () => {
            event.off(update);
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
   useEffect(() => {
      event.on(update);
      return () => {
         event.off(update);
      };
   }, [event]);
   return handle;
}
