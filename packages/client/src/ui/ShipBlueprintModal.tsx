import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { Ship1 } from "@spaceship-idle/shared/src/game/definitions/ShipDesign";
import { calculateAABB } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { cls, iMapOf, type Tile, tileToPoint } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { playClick } from "./Sound";

export function ShipBlueprintModal() {
   const [shipClass, setShipClass] = useState<ShipClass>(ShipClassList[0]);
   return (
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
            <ShipBlueprintComp layout={Ship1.Corvette} highlight={new Set(Ship1[shipClass])} width={400} />
         </div>
      </div>
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
            <div className="mi" style={{ fontSize: "72px" }}>
               lock
            </div>
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
