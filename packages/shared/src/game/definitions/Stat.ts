export const Stats = {
   Victory: {},
   Defeat: {},
   Warmonger: {},
   Backstabber: {},
} as const satisfies Record<string, {}>;

export type Stat = keyof typeof Stats;
