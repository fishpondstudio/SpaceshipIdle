export interface IMultiplier {
   value: number;
   source: string;
}

export interface Multipliers {
   xp?: number;
   hp?: number;
   damage?: number;
}

export const DefaultMultipliers: Required<Multipliers> = {
   xp: 1,
   hp: 1,
   damage: 1,
} as const;
