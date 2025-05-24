import { isAdmin } from "../../rpc/HandleMessage";

export function DevOnly({ children }: { children: React.ReactNode }) {
   if (import.meta.env.DEV) {
      return children;
   }
   return null;
}

export function DevOrAdminOnly({ children }: { children: React.ReactNode }) {
   if (import.meta.env.DEV || isAdmin()) {
      return children;
   }
   return null;
}
