const _forceProd = false;

export function DevOnly({ children }: { children: React.ReactNode }) {
   if (_forceProd) {
      return null;
   }
   if (import.meta.env.DEV) {
      return children;
   }
   return null;
}
