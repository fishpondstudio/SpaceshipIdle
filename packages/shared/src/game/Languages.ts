import { EN } from "../languages/en";
import { RU } from "../languages/ru";
import { ZH_CN } from "../languages/zh-CN";
import type { CountryCode } from "../utils/CountryCode";

export const Languages = {
   en: EN,
   zh_CN: ZH_CN,
   ru: RU,
} as const satisfies Record<string, Record<string, string>>;

export const LanguagesImage = {
   en: "GB",
   zh_CN: "CN",
   ru: "RU",
} as const satisfies Record<Language, keyof typeof CountryCode>;

export type Language = keyof typeof Languages;
