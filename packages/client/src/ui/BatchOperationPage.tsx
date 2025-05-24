import { Button, Divider, Flex, Space, Tooltip } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { round, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type { ReactNode } from "react";
import { G } from "../utils/Global";
import { SidebarComp } from "./components/SidebarComp";
import { TitleComp } from "./components/TitleComp";

export function BatchOperationPage({ selectedTiles }: { selectedTiles: Set<Tile> }): ReactNode {
   const tiles = new Set<Tile>();
   for (const tile of selectedTiles) {
      if (G.save.current.tiles.has(tile)) {
         tiles.add(tile);
      }
   }
   return (
      <SidebarComp title={t(L.SelectedXModules, tiles.size)}>
         <Space h="sm" />
         <TitleComp>{t(L.Priority)}</TitleComp>
         <Divider my="sm" />
         <Flex mx="sm" wrap="wrap" gap="xs">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => {
               return (
                  <Button
                     w="80"
                     key={p}
                     variant="outline"
                     size="compact-sm"
                     onClick={() => {
                        for (const tile of tiles) {
                           const data = G.save.current.tiles.get(tile);
                           if (data) {
                              data.priority = p;
                           }
                        }
                        GameStateUpdated.emit();
                     }}
                  >
                     {p}
                  </Button>
               );
            })}
         </Flex>
         <Divider my="sm" />
         <TitleComp>{t(L.Capacity)}</TitleComp>
         <Divider my="sm" />
         <Flex mx="sm" wrap="wrap" gap="xs">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
               return (
                  <Button
                     w="80"
                     key={p}
                     variant="outline"
                     size="compact-sm"
                     onClick={() => {
                        for (const tile of tiles) {
                           const data = G.save.current.tiles.get(tile);
                           if (data) {
                              data.capacity = round(p / 100, 1);
                           }
                        }
                        GameStateUpdated.emit();
                     }}
                  >
                     {p}
                  </Button>
               );
            })}
            <Tooltip label={t(L.MatchCapacityTooltip)}>
               <Button
                  w="80"
                  variant="outline"
                  size="compact-sm"
                  onClick={() => {
                     for (const tile of tiles) {
                        G.runtime.get(tile)?.matchCapacity();
                     }
                     GameStateUpdated.emit();
                  }}
               >
                  <div className="mi">wand_stars</div>
               </Button>
            </Tooltip>
         </Flex>
      </SidebarComp>
   );
}
