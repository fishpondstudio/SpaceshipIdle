export interface IMultiplier {
   value: number;
   source: string;
}

export interface Multipliers {
   hp?: number;
   damage?: number;
}

export const DefaultMultipliers: Required<Multipliers> = {
   hp: 1,
   damage: 1,
} as const;
