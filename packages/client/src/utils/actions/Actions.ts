import type { Action } from "./Action";
import Delay from "./Delay";
import type { EasingFunction } from "./Easing";
import { Easing } from "./Easing";
import Parallel from "./Parallel";
import Repeat from "./Repeat";
import RunFunc from "./RunFunc";
import Sequence from "./Sequence";
import { TargetAction } from "./TargetAction";

const actions: Map<number, Action> = new Map();

export function to<T extends Record<string, any>>(
   target: T,
   targetValue: Partial<Record<keyof T, any>>,
   seconds: number,
   interpolation: EasingFunction = Easing.Linear,
): Action {
   return new TargetAction(target, targetValue, seconds, interpolation);
}

export function delay(seconds: number): Action {
   return new Delay(seconds);
}

export function runFunc(fn: () => void): Action {
   return new RunFunc(fn);
}

export function sequence(...actions: Array<Action>): Action {
   return new Sequence(...actions);
}

export function parallel(...actions: Array<Action>): Action {
   return new Parallel(...actions);
}

export function repeat(action: Action, times = -1): Action {
   return new Repeat(action, times);
}

export function start(action: Action) {
   actions.set(action.id, action);
}

export function isPlaying(action: Action): boolean {
   return actions.has(action.id);
}

export function pause(action: Action) {
   actions.delete(action.id);
}

export function clear(target: object) {
   for (const [id, action] of actions) {
      if (action instanceof TargetAction && action.target === target) {
         actions.delete(id);
      }
   }
}

export function tickActions(delta: number) {
   for (const [id, action] of actions) {
      const done = action.tick(delta);
      if (done) {
         action.done = true;
         actions.delete(id);
         // Are there any queued events?
         for (let j = 0; j < action.queued.length; j++) {
            start(action.queued[j]);
         }
         action.queued = [];
      }
   }
}
