import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { isEnemy } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import type { Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { useEffect } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BatchOperationPage } from "./BatchOperationPage";
import { BuildingPage } from "./BuildingPage";
import { SidebarComp } from "./components/SidebarComp";
import { ConstructionPage } from "./ConstructionPage";
import { hideSidebar } from "./Sidebar";

export function TilePage({ selectedTiles }: { selectedTiles: Set<Tile> }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);

   useEffect(() => {
      if (!G.runtime || G.runtime.battleType !== BattleType.Peace) {
         hideSidebar();
      }
   }, []);

   if (selectedTiles.size === 1) {
      for (const tile of selectedTiles) {
         const data = G.save.current.tiles.get(tile);
         if (data) {
            return <BuildingPage tile={tile} gs={G.save.current} readonly={false} />;
         }
         const enemy = G.runtime.right.tiles.get(tile);
         if (enemy) {
            return <BuildingPage tile={tile} gs={G.runtime.right} readonly={true} />;
         }
         if (isEnemy(tile)) {
            return <HideSidebar key={tile} />;
         }
         return <ConstructionPage tile={tile} gs={G.save.current} />;
      }
   }

   return <BatchOperationPage selectedTiles={selectedTiles} />;
}

function HideSidebar(): React.ReactNode {
   useEffect(hideSidebar, []);
   return <SidebarComp title={null} />;
}
