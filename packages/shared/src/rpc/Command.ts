import { hasFlag } from "../utils/Helper";
import { type IUser, UserFlags } from "./ServerMessageTypes";

export function requireArgs(args: string[], count: number): void {
   if (args.length !== count) {
      throw new Error("Invalid command format");
   }
}

export function requireMod(user: IUser): void {
   if (hasFlag(user.json.flags, UserFlags.Mod)) {
      return;
   }
   if (hasFlag(user.json.flags, UserFlags.Admin)) {
      return;
   }
   throw new Error("Not authorized");
}

export function requireAdmin(user: IUser | null | undefined): void {
   if (user && hasFlag(user.json.flags, UserFlags.Admin)) {
      return;
   }
   throw new Error("Not authorized");
}
