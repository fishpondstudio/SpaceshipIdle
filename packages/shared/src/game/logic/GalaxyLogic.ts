import { AABB } from "../../utils/AABB";
import type { Circle } from "../../utils/Circle";
import { CURRENCY_EPSILON, capitalize, clamp, hasFlag, rand, randomAlphaNumeric, shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Generator } from "../../utils/NameGen";
import { srand } from "../../utils/Random";
import type { IHaveXY } from "../../utils/Vector2";
import type { Addon } from "../definitions/Addons";
import { Bonus } from "../definitions/Bonus";
import { ExploreCostPerLightYear, FriendshipBaseCost, FriendshipDurationSeconds } from "../definitions/Constant";
import { FriendshipBonus } from "../definitions/FriendshipBonus";
import { type Galaxy, type Planet, PlanetFlags, PlanetType, type StarSystem } from "../definitions/Galaxy";
import { ShipClass, ShipClassList } from "../definitions/ShipClass";
import type { GameState, SaveGame } from "../GameState";
import { getAddonsInClass } from "./AddonLogic";
import { getWarmongerPenalty } from "./PeaceTreatyLogic";
import { getStat, trySpendResource } from "./ResourceLogic";
import type { Runtime } from "./Runtime";
import { getPreviousShipClass, getShipClass } from "./TechLogic";

export function findMyself(galaxy: Galaxy): Planet | undefined {
   for (const starSystem of galaxy.starSystems) {
      for (const planet of starSystem.planets) {
         if (planet.type === PlanetType.Me) return planet;
      }
   }
   return undefined;
}

export function findPlanet(id: number, galaxy: Galaxy): Planet | undefined {
   for (const starSystem of galaxy.starSystems) {
      for (const planet of starSystem.planets) {
         if (planet.id === id) return planet;
      }
   }
   return undefined;
}

export function getAddonReward(seed: string, gs: GameState): Addon[] {
   const shipClass = getShipClass(gs);
   const addons = getAddonsInClass(shipClass);
   const random = srand(seed);
   shuffle(addons, random);
   const [addon, ...candidates] = addons;
   const previousShipClass = getPreviousShipClass(shipClass);
   if (previousShipClass) {
      getAddonsInClass(previousShipClass).forEach((b) => {
         candidates.push(b);
      });
   }
   shuffle(candidates, random);
   const result = candidates.slice(0, 2);
   result.unshift(addon);
   return result;
}

interface ValueBreakdown {
   name: string;
   desc?: string;
   value: number;
}

export function getWarPenalty(gs: GameState, planet?: Planet): ValueBreakdown[] {
   if (!planet) return [{ name: t(L.WarmongerPenalty), value: 1 }];
   if (planet.type === PlanetType.Pirate) {
      return [{ name: t(L.WarmongerPenalty), desc: t(L.BecauseTheyArePirates), value: 0 }];
   }
   if (planet.type === PlanetType.State) {
      const result: ValueBreakdown[] = [{ name: t(L.WarmongerPenalty), value: 1 }];
      if (hasFlag(planet.flags, PlanetFlags.WasFriends)) {
         result.push({ name: t(L.BackstabberPenalty), desc: t(L.BecauseYouWereFriendsWithThem), value: 1 });
      }
      return result;
   }
   return [];
}

export function getMaxFriendship(gs: GameState): [number, ValueBreakdown[]] {
   const shipClass = getShipClass(gs);
   const def = ShipClass[shipClass];
   const result = ShipClassList.indexOf(shipClass) + 1;
   return [result, [{ name: t(L.XClass, def.name()), value: result }]];
}

export function getPlanetStatusLabel(planet: Planet): string {
   if (planet.friendshipTimeLeft > 0) {
      return "Friends";
   }
   if (planet.battleResult) {
      if (planet.battleResult.battleScore > 0) {
         return "Victory";
      }
      return "Defeat";
   }
   if (planet.type === PlanetType.Pirate) {
      return "Pirate";
   }
   return "Neutral";
}

export function hasAvailableFriendship(save: SaveGame): boolean {
   return getMaxFriendship(save.state)[0] > getCurrentFriendship(save);
}

export function hasAvailablePirates(galaxy: Galaxy): boolean {
   for (const starSystem of galaxy.starSystems) {
      if (starSystem.discovered) {
         for (const planet of starSystem.planets) {
            if (planet.type === PlanetType.Pirate && !planet.battleResult) {
               return true;
            }
         }
      }
   }
   return false;
}

export function getExploreCost(starSystem: StarSystem): number {
   return starSystem.distance * ExploreCostPerLightYear;
}

export function getShipClassByIndex(idx: number): ShipClass {
   return ShipClassList[clamp(idx, 0, ShipClassList.length - 1)];
}

export function getPlanetShipClass(planetId: number, galaxy: Galaxy): ShipClass {
   for (const starSystem of galaxy.starSystems) {
      for (const planet of starSystem.planets) {
         if (planet.id === planetId) {
            return getShipClassByIndex(starSystem.distance);
         }
      }
   }
   return ShipClassList[0];
}

export function getCurrentFriendship(save: SaveGame, friends?: Planet[]): number {
   let result = 0;
   for (const starSystem of save.data.galaxy.starSystems) {
      for (const planet of starSystem.planets) {
         if (planet.friendshipTimeLeft > 0) {
            friends?.push(planet);
            ++result;
         }
      }
   }
   return result;
}

export function getAvailableFriendship(gs: SaveGame): number {
   return getMaxFriendship(gs.state)[0] - getCurrentFriendship(gs);
}

export function tickGalaxy(rt: Runtime): void {
   for (const starSystem of rt.leftSave.data.galaxy.starSystems) {
      for (const planet of starSystem.planets) {
         if (planet.type !== PlanetType.State) {
            continue;
         }

         if (planet.friendshipTimeLeft > 0) {
            --planet.friendshipTimeLeft;

            const def = Bonus[planet.friendshipBonus];
            def.onTick?.(planet.friendshipTimeLeft, t(L.FriendshipWith, planet.name), rt);
            if (planet.friendshipTimeLeft === 0) {
               def.onStop?.(rt);
            }
         }

         if (planet.friendshipTimeLeft === 0 && hasFlag(planet.flags, PlanetFlags.AutoRenewFriendship)) {
            const totalCost = getWarmongerPenalty(rt.left) + getStat("Backstabber", rt.left.stats) + FriendshipBaseCost;
            if (trySpendResource("VictoryPoint", totalCost, rt.left.resources)) {
               planet.friendshipTimeLeft = FriendshipDurationSeconds;
            }
         }
      }
   }
}

export const PlanetTextures = [
   "Planet1",
   "Planet2",
   "Planet3",
   "Planet4",
   "Planet5",
   "Planet6",
   "Planet7",
   "Planet8",
   "Planet9",
   "Planet10",
] as const;

export const PirateTextures = ["Pirate"];

export const StarTextures = ["Star1"];

export function generateGalaxy(random: () => number): [Galaxy, AABB] {
   const circles = packCircles(
      [{ x: 0, y: 0, r: 300 }].concat(
         shuffle(
            [
               { x: 0, y: 0, r: 500 },
               { x: 0, y: 0, r: 400 },
               { x: 0, y: 0, r: 400 },
               { x: 0, y: 0, r: 300 },
               { x: 0, y: 0, r: 250 },
               { x: 0, y: 0, r: 250 },
            ],
            random,
         ),
      ),
      random,
   );
   const aabb = AABB.fromCircles(circles);
   const galaxy: Galaxy = { starSystems: [] };
   aabb.extendBy({ x: aabb.width * 0.2, y: aabb.height * 0.2 });
   const offset = aabb.min;
   circles.forEach((circle) => {
      circle.x = circle.x - offset.x;
      circle.y = circle.y - offset.y;
   });
   let id = 0;
   let me: IHaveXY | null = null;
   for (let i = 0; i < circles.length; ++i) {
      const circle = circles[i];
      const initial = i === 0;
      const starId = ++id;
      const starSystem: StarSystem = {
         id: starId,
         name: capitalize(new Generator("ssV").toString()),
         texture: StarTextures[starId % StarTextures.length],
         x: circle.x,
         y: circle.y,
         r: circle.r,
         discovered: initial,
         distance: 0,
         planets: [],
      };

      let r = circle.r - rand(25, 50);

      while (r >= 50) {
         const planetId = ++id;
         const type = Math.random() < 1 / 3 ? PlanetType.Pirate : PlanetType.State;
         const texture =
            type === PlanetType.State
               ? PlanetTextures[planetId % PlanetTextures.length]
               : PirateTextures[planetId % PirateTextures.length];
         const planet: Planet = {
            id: planetId,
            name: capitalize(new Generator("sss").toString()),
            radian: random() * 2 * Math.PI,
            texture,
            r,
            speed: rand(-0.02, 0.02),
            type,
            flags: PlanetFlags.None,
            seed: randomAlphaNumeric(16),
            battleResult: null,
            friendshipBonus: "Reduce1WarmongerPerSec",
            friendshipTimeLeft: 0,
            revealed: false,
         };
         starSystem.planets.push(planet);
         r -= rand(30, 70);
      }

      if (initial) {
         me = { x: starSystem.x, y: starSystem.y };
         shuffle(starSystem.planets);
         for (let i = 0; i < starSystem.planets.length; ++i) {
            if (i === 0) {
               const planet = starSystem.planets[i];
               planet.type = PlanetType.Me;
               planet.texture = "Spaceship";
            } else if (i === 1) {
               const pirate = starSystem.planets[i];
               pirate.type = PlanetType.Pirate;
               pirate.texture = PirateTextures[pirate.id % PirateTextures.length];
            } else {
               const planet = starSystem.planets[i];
               planet.type = PlanetType.State;
               planet.texture = PlanetTextures[planet.id % PlanetTextures.length];
            }
         }
      }

      galaxy.starSystems.push(starSystem);
   }

   galaxy.starSystems.sort((a, b) => {
      if (!me) return 0;
      return Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y);
   });

   for (let i = 0; i < galaxy.starSystems.length; ++i) {
      const starSystem = galaxy.starSystems[i];
      if (i > 0) {
         starSystem.distance = i;
      }
      const shipClass = getShipClassByIndex(starSystem.distance);
      const candidates = shuffle(FriendshipBonus[shipClass].slice(0));
      for (let j = 0; j < starSystem.planets.length; ++j) {
         const planet = starSystem.planets[j];
         planet.friendshipBonus = candidates[j % candidates.length];
         planet.revealed = planet.type !== PlanetType.State;
      }
   }

   return [galaxy, aabb];
}

// This function packs circles using the following algorithm:
// - The first circle starts at (0, 0)
// - The second circle is placed tangent to the first circle, at a random angle
// - Iterate over the remaining circles, find the first circle that can be placed tangent to the previous two circles and does not overlap with any packed circles, add to the result with updated x,y. If there are multiple solutions, pick a random one
// - Do this until all circles are packed. If a circle cannot be packed, just ignore it
function packCircles(circles: Circle[], random: () => number): Circle[] {
   if (circles.length === 0) return [];

   // The result array of packed circles
   const packed: Circle[] = [];

   // Place the first circle at (0, 0)
   const first = { ...circles[0], x: 0, y: 0 };
   packed.push(first);

   if (circles.length === 1) return packed;

   // Place the second circle tangent to the first at a random angle
   const angle = random() * 2 * Math.PI;
   const d = circles[0].r + circles[1].r;
   const second = {
      ...circles[1],
      x: Math.cos(angle) * d,
      y: Math.sin(angle) * d,
   };
   packed.push(second);

   // For each remaining circle, try to place it tangent to two previous circles
   for (let i = 2; i < circles.length; ++i) {
      const candidates: { x: number; y: number }[] = [];

      // Try all pairs of packed circles (j, k) with j < k
      for (let j = 0; j < packed.length; ++j) {
         for (let k = j + 1; k < packed.length; ++k) {
            const c1 = packed[j];
            const c2 = packed[k];
            const r1 = c1.r + circles[i].r;
            const r2 = c2.r + circles[i].r;
            const x1 = c1.x;
            const y1 = c1.y;
            const x2 = c2.x;
            const y2 = c2.y;

            // Compute intersection points of two circles of radius r1 and r2 centered at (x1,y1) and (x2,y2)
            const dx = x2 - x1;
            const dy = y2 - y1;
            const d = Math.sqrt(dx * dx + dy * dy);

            // No solution if circles are too far apart or too close
            if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) continue;

            // Find intersection points
            const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
            const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
            const xm = x1 + (a * dx) / d;
            const ym = y1 + (a * dy) / d;
            const rx = -dy * (h / d);
            const ry = dx * (h / d);

            // Two possible positions
            candidates.push({ x: xm + rx, y: ym + ry });
            if (h > CURRENCY_EPSILON) {
               // If h == 0, only one intersection
               candidates.push({ x: xm - rx, y: ym - ry });
            }
         }
      }

      shuffle(candidates, random);

      // Find the first candidate that does not overlap any packed circle
      for (const pos of candidates) {
         const candidate = { ...circles[i], x: pos.x, y: pos.y };
         if (!overlapsAny(candidate, packed)) {
            packed.push(candidate);
            break;
         }
      }
   }

   return packed;
}

function overlapsAny(circle: Circle, packed: Circle[]): boolean {
   for (const c of packed) {
      const dx = c.x - circle.x;
      const dy = c.y - circle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < c.r + circle.r - 1e-6) return true;
   }
   return false;
}
