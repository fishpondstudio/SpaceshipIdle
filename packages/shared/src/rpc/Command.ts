import { formatHMS, HOUR, hasFlag } from "../utils/Helper";
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

export function requireAuthenticated(user: IUser | null | undefined): void {
   if (!user) {
      throw new Error("Not authenticated");
   }
   const timeSinceCreation = Date.now() - user.json.createdAt;
   if (user.platformId.startsWith("web:") && timeSinceCreation < 48 * HOUR) {
      throw new Error(
         `Only available for guest account with more than 48 hours of registration - you have ${formatHMS(48 * HOUR - timeSinceCreation)} left. Play on Steam to get full access immediately`,
      );
   }
}
