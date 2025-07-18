export interface IMultiplier {
   value: number;
   source: string;
}

export type Multipliers = RequireAtLeastOne<{
   hp?: number;
   damage?: number;
}>;

export type RequireAtLeastOne<T> = {
   [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export const DefaultMultipliers: Required<Multipliers> = {
   hp: 1,
   damage: 1,
} as const;
