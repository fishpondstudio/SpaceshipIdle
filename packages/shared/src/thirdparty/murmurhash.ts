// @ts-nocheck

export function murmurhash3(key: string, seed: number): number {
   let k1: number;
   const remainder: number = key.length & 3; // key.length % 4
   const bytes: number = key.length - remainder;
   let h1 = seed;
   let h1b: number;
   const c1 = 0xcc9e2d51;
   const c2 = 0x1b873593;
   let i = 0;

   while (i < bytes) {
      k1 =
         (key.charCodeAt(i) & 0xff) |
         ((key.charCodeAt(++i) & 0xff) << 8) |
         ((key.charCodeAt(++i) & 0xff) << 16) |
         ((key.charCodeAt(++i) & 0xff) << 24);
      ++i;

      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
      h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
   }

   k1 = 0;

   switch (remainder) {
      // biome-ignore lint/suspicious/noFallthroughSwitchClause:
      case 3:
         k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      // biome-ignore lint/suspicious/noFallthroughSwitchClause:
      case 2:
         k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      case 1:
         k1 ^= key.charCodeAt(i) & 0xff;

         k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
         k1 = (k1 << 15) | (k1 >>> 17);
         k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
         h1 ^= k1;
   }

   h1 ^= key.length;

   h1 ^= h1 >>> 16;
   h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
   h1 ^= h1 >>> 13;
   h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
   h1 ^= h1 >>> 16;

   return h1 >>> 0;
}
