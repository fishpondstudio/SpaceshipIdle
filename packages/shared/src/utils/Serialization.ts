import { decode, DecodeError, encode, ExtensionCodec } from "@msgpack/msgpack";

const extensionCodec = new ExtensionCodec();

// Set<T>
const SET_EXT_TYPE = 0; // Any in 0-127
extensionCodec.register({
   type: SET_EXT_TYPE,
   encode: (object: unknown): Uint8Array | null => {
      if (object instanceof Set) {
         return encode([...object], { extensionCodec });
      }
      return null;
   },
   decode: (data: Uint8Array) => {
      const array = decode(data, { extensionCodec }) as Array<unknown>;
      return new Set(array);
   },
});

// Map<K, V>
const MAP_EXT_TYPE = 1; // Any in 0-127
extensionCodec.register({
   type: MAP_EXT_TYPE,
   encode: (object: unknown): Uint8Array | null => {
      if (object instanceof Map) {
         return encode([...object], { extensionCodec });
      }
      return null;
   },
   decode: (data: Uint8Array) => {
      const array = decode(data, { extensionCodec }) as Array<[unknown, unknown]>;
      return new Map(array);
   },
});

// to define a custom codec:
const BIGINT_EXT_TYPE = 2; // Any in 0-127
extensionCodec.register({
   type: BIGINT_EXT_TYPE,
   encode(input: unknown): Uint8Array | null {
      if (typeof input === "bigint") {
         if (input <= Number.MAX_SAFE_INTEGER && input >= Number.MIN_SAFE_INTEGER) {
            return encode(Number(input));
         }
         return encode(String(input));
      }
      return null;
   },
   decode(data: Uint8Array): bigint {
      const val = decode(data);
      if (!(typeof val === "string" || typeof val === "number")) {
         throw new DecodeError(`unexpected BigInt source: ${val} (${typeof val})`);
      }
      return BigInt(val);
   },
});

export function msgpackEncode(obj: unknown): Uint8Array {
   return encode(obj, { extensionCodec });
}

export function msgpackDecode<T>(data: Uint8Array): T {
   return decode(data, { extensionCodec }) as T;
}

export function jsonEncode(obj: any): string {
   return JSON.stringify(obj, replacer);
}

export function jsonDecode<T>(json: string): T {
   return JSON.parse(json, reviver) as T;
}

function replacer(key: string, value: any): any {
   if (value instanceof Map) {
      return {
         $type: "Map",
         value: Array.from(value.entries()),
      };
   }
   if (value instanceof Set) {
      return {
         $type: "Set",
         value: Array.from(value.values()),
      };
   }
   if (value instanceof BigInt) {
      return {
         $type: "BigInt",
         value: String(value),
      };
   }
   return value;
}

function reviver(key: string, value: any): any {
   if (typeof value === "object" && value !== null) {
      if (value.$type === "Map") {
         return new Map(value.value);
      }
      if (value.$type === "Set") {
         return new Set(value.value);
      }
      if (value.$type === "BigInt") {
         return BigInt(value.value);
      }
   }
   return value;
}
