import { EN } from "../languages/en";

export const Languages = {
   en: EN,
} as const satisfies Record<string, Record<string, string>>;

export const ChatLanguages = {
   en: EN.Language,
} as const satisfies Record<keyof typeof Languages, string>;

export type ChatLanguage = keyof typeof ChatLanguages;
