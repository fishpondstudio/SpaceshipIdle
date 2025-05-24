import { type DependencyList, useEffect, useState } from "react";

export function usePromise<T>(promise: Promise<T>, deps: DependencyList): T | undefined {
   const [state, setState] = useState<T | undefined>(undefined);
   // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
   useEffect(() => {
      promise.then(setState);
   }, deps);
   return state;
}
