import { DE } from "../languages/de";
import { EN } from "../languages/en";
import { ES } from "../languages/es";
import { FR } from "../languages/fr";
import { JA } from "../languages/ja";
import { KO } from "../languages/ko";
import { PT_BR } from "../languages/pt-BR";
import { RU } from "../languages/ru";
import { ZH_CN } from "../languages/zh-CN";

export const Languages = {
   en: EN,
   zh_CN: ZH_CN,
   es: ES,
   pt_BR: PT_BR,
   ru: RU,
   de: DE,
   fr: FR,
   ja: JA,
   ko: KO,
} as const satisfies Record<string, Record<string, string>>;

export const ChatLanguages = {
   en: EN.$Language,
} as const satisfies Partial<Record<keyof typeof Languages, string>>;

export type ChatLanguage = keyof typeof ChatLanguages;
