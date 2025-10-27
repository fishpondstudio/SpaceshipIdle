import { Select } from "@mantine/core";
import { type Blueprint, Blueprints } from "@spaceship-idle/shared/src/game/definitions/Blueprints";
import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { calculateAABB, getFullShipBlueprint } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { getBuildingsWithinShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { cls, iMapOf, randOne, type Tile, tileToPoint } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { G } from "../utils/Global";
import { html } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function ShipBlueprintModal() {
   const [shipClass, setShipClass] = useState<ShipClass>(ShipClassList[0]);
   const [blueprint, setBlueprint] = useState<Blueprint>(G.save.state.blueprint);
   const desc = Blueprints[blueprint].desc;
   return (
      <>
         {import.meta.env.DEV && (
            <button
               className="btn mx10 mt10"
               onClick={() => {
                  G.save.state.tiles.clear();
                  G.save.state.blueprint = blueprint;
                  const buildings = getBuildingsWithinShipClass(shipClass);
                  Blueprints[blueprint].blueprint[shipClass].forEach((tile) => {
                     G.save.state.tiles.set(tile, { type: randOne(buildings), level: 1 });
                     G.runtime.expire(tile);
                  });
                  GameStateUpdated.emit();
               }}
            >
               Load
            </button>
         )}
         <Select
            className="m10"
            checkIconPosition="right"
            allowDeselect={false}
            data={Object.entries(Blueprints).map(([key, def]) => ({
               label: t(L.SpaceshipPrefix, def.name()),
               value: key,
            }))}
            value={blueprint}
            onChange={(value) => setBlueprint(value as Blueprint)}
         />
         {desc ? (
            <div className="panel m10 py5">
               <div className="h5" />
               <div className="title my5">{t(L.UniqueBonus)}</div>
               <div className="h5" />
               {html(desc(), "render-html")}
            </div>
         ) : null}
         <div className="divider" />
         <div className="row g0">
            <div className="f1 stretch ship-blueprint-tabs">
               {ShipClassList.map((shipClass_) => (
                  <div
                     className={cls(shipClass_ === shipClass ? "active" : null)}
                     key={shipClass_}
                     onClick={() => {
                        playClick();
                        setShipClass(shipClass_);
                     }}
                  >
                     {ShipClass[shipClass_].name()}
                  </div>
               ))}
            </div>
            <div className="divider vertical"></div>
            <div className="m20">
               <ShipBlueprintComp
                  layout={getFullShipBlueprint(Blueprints[blueprint].blueprint)}
                  highlight={new Set(Blueprints[blueprint].blueprint[shipClass])}
                  width={400}
               />
            </div>
         </div>
      </>
   );
}

const MarginPercent = 0.15;

export function ShipBlueprintComp({
   layout,
   width,
   height,
   highlight,
}: {
   layout: Iterable<Tile>;
   highlight: Set<Tile>;
   width?: number;
   height?: number;
}): React.ReactNode {
   const aabb = calculateAABB(layout);
   if (width && height) {
      throw new Error("width and height cannot be set at the same time");
   }
   let tileSize: number;
   if (width) {
      tileSize = width / (aabb.width + 1);
      height = (width * (aabb.height + 1)) / (aabb.width + 1);
   }
   if (height) {
      tileSize = height / (aabb.height + 1);
      width = (height * (aabb.width + 1)) / (aabb.height + 1);
   }
   if (highlight.size === 0) {
      return (
         <div className="col g5 text-dimmed" style={{ width, height }}>
            <TextureComp name="Others/Drill" width={24 * 3} />
            <div>{t(L.UnderDevelopment)}</div>
            <div className="h20" />
         </div>
      );
   }
   const min = aabb.min;
   return (
      <div className="ship-blueprint" style={{ width, height }}>
         {iMapOf(layout, (tile) => {
            const { x, y } = tileToPoint(tile);
            return (
               <div
                  key={tile}
                  style={{
                     left: (x - min.x) * tileSize,
                     top: (y - min.y) * tileSize,
                     margin: (tileSize * MarginPercent) / 2,
                     width: tileSize * (1 - MarginPercent),
                     height: tileSize * (1 - MarginPercent),
                     opacity: highlight.has(tile) ? 0.75 : 0.25,
                  }}
               ></div>
            );
         })}
      </div>
   );
}
