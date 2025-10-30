import { Badge, SegmentedControl, TextInput } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { type BuildingType, BuildingTypeLabel } from "@spaceship-idle/shared/src/game/definitions/BuildingType";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { makeTile } from "@spaceship-idle/shared/src/game/ITileData";
import {
   getBuildingCost,
   getBuildingName,
   getUnlockedBuildings,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { canSpendResources, trySpendResources } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { isTileConnected, isWithinShipExtent } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import {
   clearFlag,
   cls,
   entriesOf,
   formatNumber,
   hasFlag,
   mapSafeAdd,
   setFlag,
} from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { memo, type ReactNode, useCallback, useMemo, useState } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { FloatingTip } from "./components/FloatingTip";
import { ResourceListComp } from "./components/ResourceListComp";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { VideoTutorialComp } from "./components/VideoTutorialComp";
import type { ITileWithGameState } from "./ITileWithGameState";
import { NotConnectedPage } from "./NotConnectedPage";
import { NotWithinExtentPage } from "./NotWithinExtentPage";
import { playError } from "./Sound";

export function ConstructionPage({ tile, gs }: ITileWithGameState): ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const [selected, setSelected] = useState(new Set<BuildingType>());
   const [search, setSearch] = useState("");
   const build = useCallback(
      (building: Building) => {
         if (trySpendResources({ XP: getBuildingCost(building, 1), Quantum: 1 }, gs.resources)) {
            gs.tiles.set(tile, makeTile(building, 1));
            GameStateUpdated.emit();
         } else {
            playError();
         }
      },
      [gs, tile],
   );
   const canBuild = useCallback(
      (building: Building) => {
         return canSpendResources({ XP: getBuildingCost(building, 1), Quantum: 1 }, gs.resources);
      },
      [gs],
   );
   const constructed = useMemo(() => {
      const constructed = new Map<Building, number>();
      gs.tiles.forEach((data) => {
         mapSafeAdd(constructed, data.type, 1);
      });
      return constructed;
   }, [gs]);
   if (!isWithinShipExtent(tile, gs)) {
      return <NotWithinExtentPage />;
   }
   if (!isTileConnected(tile, gs)) {
      return <NotConnectedPage />;
   }
   const isGridView = hasFlag(G.save.options.flag, GameOptionFlag.BuildingGridView);
   return (
      <SidebarComp title={t(L.Build)}>
         <div className="row m10">
            <TextInput
               leftSection={<div className="mi sm">search</div>}
               rightSection={
                  search.length > 0 ? (
                     <div className="mi sm pointer" onClick={() => setSearch("")}>
                        clear
                     </div>
                  ) : null
               }
               onKeyDown={(event) => {
                  if (event.key === "Escape") {
                     setSearch("");
                  }
               }}
               className="f1"
               value={search}
               onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <SegmentedControl
               data={[
                  { label: <div className="mi sm">list_alt</div>, value: "list" },
                  { label: <div className="mi sm">grid_view</div>, value: "grid" },
               ]}
               value={isGridView ? "grid" : "list"}
               onChange={(value) => {
                  G.save.options.flag =
                     value === "grid"
                        ? setFlag(G.save.options.flag, GameOptionFlag.BuildingGridView)
                        : clearFlag(G.save.options.flag, GameOptionFlag.BuildingGridView);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="divider" />
         <div className="row g5 m10" style={{ flexWrap: "wrap", justifyContent: "flex-start" }}>
            {entriesOf(BuildingTypeLabel)
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
         <div className="divider" />
         <VideoTutorialComp tutorial="Copy" className="mx10 mt10" />
         <VideoTutorialComp tutorial="Multiselect" className="mx10 mt10" />
         <div
            className={cls(hasFlag(G.save.options.flag, GameOptionFlag.BuildingGridView) ? "building-grid-view" : null)}
         >
            {getUnlockedBuildings(gs)
               .sort((a, b) => a.localeCompare(b))
               .filter((b) => {
                  const def = Config.Buildings[b];
                  const searchCondition = getBuildingName(b).toLowerCase().includes(search.trim().toLowerCase());
                  if (selected.size === 0) {
                     return searchCondition;
                  }
                  return selected.has(def.type) && searchCondition;
               })
               .map((b) => {
                  if (isGridView) {
                     return <BuildingGridComp key={b} building={b} canBuild={canBuild(b)} onClick={build} />;
                  }
                  return (
                     <BuildingListComp
                        constructed={constructed.get(b) ?? 0}
                        key={b}
                        building={b}
                        canBuild={canBuild(b)}
                        onClick={build}
                     />
                  );
               })}
         </div>
      </SidebarComp>
   );
}

function _BuildingListComp({
   building,
   constructed,
   canBuild,
   onClick,
}: {
   building: Building;
   constructed: number;
   canBuild: boolean;
   onClick: (building: Building) => void;
}): React.ReactNode {
   const def = Config.Buildings[building];
   const label = BuildingTypeLabel[def.type]();
   return (
      <FloatingTip w={300} label={<BuildingTooltip building={building} />} key={building}>
         <div
            className="row p10 m10"
            onClick={onClick.bind(null, building)}
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
                  <div>{getBuildingName(building)}</div>
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
      </FloatingTip>
   );
}

function _BuildingTooltip({ building }: { building: Building }): React.ReactNode {
   return (
      <>
         <div className="row g5">
            <div className="f1">{getBuildingName(building)}</div>
            <TextureComp name={`Building/${building}`} />
         </div>
         <div className="subtitle">{t(L.ConstructionCost)}</div>
         <ResourceListComp res={{ XP: -getBuildingCost(building, 1), Quantum: -1 }} />
         <div className="subtitle">Basic Info</div>
         <BuildingInfoComp building={building} />
      </>
   );
}

export const BuildingTooltip = memo(_BuildingTooltip, (prev, next) => prev.building === next.building);

export const BuildingListComp = memo(
   _BuildingListComp,
   (prev, next) =>
      prev.building === next.building &&
      prev.constructed === next.constructed &&
      prev.canBuild === next.canBuild &&
      prev.onClick === next.onClick,
);

function _BuildingGridComp({
   building,
   canBuild,
   onClick,
}: {
   building: Building;
   canBuild: boolean;
   onClick: (building: Building) => void;
}): React.ReactNode {
   return (
      <FloatingTip w={300} label={<BuildingTooltip building={building} />}>
         <div className={cls("item", canBuild ? null : "disabled")} onClick={onClick.bind(null, building)}>
            <TextureComp name={`Building/${building}`} width={32} />
         </div>
      </FloatingTip>
   );
}

export const BuildingGridComp = memo(
   _BuildingGridComp,
   (prev, next) => prev.building === next.building && prev.canBuild === next.canBuild && prev.onClick === next.onClick,
);
