import type { ValueOf } from "../utils/Helper";

export const ServerWSErrorCode = {
   Ok: 0,
   BadRequest: 3000,
   InvalidTicket: 3001,
   NotAllowed: 3002,
   SessionExpired: 3003,
   Background: 4000,
} as const;

export type ServerWSErrorCode = ValueOf<typeof ServerWSErrorCode>;
