import { Badge, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { CodeLabel, type CodeNumber } from "@spaceship-idle/shared/src/game/definitions/CodeNumber";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { makeTile } from "@spaceship-idle/shared/src/game/ITileData";
import {
   canSpend,
   getBuildingCost,
   getUnlockedBuildings,
   trySpend,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { getAvailableQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { isTileConnected, isWithinShipExtent } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { entriesOf, formatNumber, mapSafeAdd, type Tile } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { type ReactNode, useState } from "react";
import { G } from "../utils/Global";
import { ResourceListComp } from "./components/ResourceListComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { VideoTutorialComp } from "./components/VideoTutorialComp";
import type { ITileWithGameState } from "./ITileWithGameState";
import { NotConnectedPage } from "./NotConnectedPage";
import { NotWithinExtentPage } from "./NotWithinExtentPage";
import { playError } from "./Sound";

export function ConstructionPage({ tile, gs }: ITileWithGameState): ReactNode {
   const [selected, setSelected] = useState(new Set<CodeNumber>());
   if (!isWithinShipExtent(tile, gs)) {
      return <NotWithinExtentPage />;
   }
   if (!isTileConnected(tile, gs)) {
      return <NotConnectedPage />;
   }
   const constructed = new Map<Building, number>();
   G.save.current.tiles.forEach((data) => {
      mapSafeAdd(constructed, data.type, 1);
   });
   return (
      <SidebarComp title={t(L.Build)}>
         <div className="row g5 m10" style={{ flexWrap: "wrap", justifyContent: "flex-start" }}>
            {entriesOf(CodeLabel)
               .sort(([a, al], [b, bl]) => al().localeCompare(bl()))
               .map(([code, label]) => {
                  return (
                     <Badge
                        style={{ cursor: "pointer" }}
                        key={code}
                        variant={selected.has(code) ? "filled" : "default"}
                        onClick={() => {
                           const newVal = new Set(selected);
                           if (newVal.has(code)) {
                              newVal.delete(code);
                           } else {
                              newVal.add(code);
                           }
                           setSelected(newVal);
                        }}
                     >
                        {label()}
                     </Badge>
                  );
               })}
         </div>
         <VideoTutorialComp tutorial="Copy" className="mx10 mt10" />
         <VideoTutorialComp tutorial="Multiselect" className="mx10 mt10" />
         {getUnlockedBuildings(gs)
            .sort((a, b) => Config.Buildings[a].name().localeCompare(Config.Buildings[b].name()))
            .filter((b) => {
               const def = Config.Buildings[b];
               if (selected.size === 0) {
                  return true;
               }
               return selected.has(def.code);
            })
            .map((b) => {
               return <BuildingComp constructed={constructed.get(b) ?? 0} key={b} building={b} gs={gs} tile={tile} />;
            })}
      </SidebarComp>
   );
}

function BuildingComp({
   building,
   constructed,
   tile,
   gs,
}: {
   building: Building;
   constructed: number;
   tile: Tile;
   gs: GameState;
}): React.ReactNode {
   const def = Config.Buildings[building];
   const label = CodeLabel[def.code]();
   const canBuild = canSpend(getBuildingCost(building, 1), gs) && getAvailableQuantum(gs) > 0;
   return (
      <Tooltip
         label={
            getAvailableQuantum(gs) <= 0 ? (
               t(L.NotEnoughQuantum)
            ) : (
               <ResourceListComp xp={getBuildingCost(building, 1)} />
            )
         }
         key={building}
      >
         <div
            className="row p10 m10"
            onClick={() => {
               if (!canSpend(getBuildingCost(building, 1), gs) || getAvailableQuantum(gs) <= 0) {
                  playError();
                  return;
               }
               if (trySpend(getBuildingCost(building, 1), gs)) {
                  gs.tiles.set(tile, makeTile(building, 1));
                  GameStateUpdated.emit();
               }
            }}
            style={{
               cursor: canBuild ? "pointer" : "not-allowed",
               border: "1px solid rgba(255,255,255,0.15)",
               borderRadius: 5,
               opacity: canBuild ? 1 : 0.25,
            }}
         >
            <TextureComp name={`Building/${building}`} />
            <div className="f1">
               <div className="row g5">
                  <div>{def.name()}</div>
                  <div className="text-xs text-space">{label}</div>
                  <div className="f1"></div>
               </div>
            </div>
            {constructed ? (
               <Badge color="gray" variant="default">
                  {formatNumber(constructed)}
               </Badge>
            ) : null}
         </div>
      </Tooltip>
   );
}
