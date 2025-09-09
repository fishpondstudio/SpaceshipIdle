import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { Ship1 } from "@spaceship-idle/shared/src/game/definitions/ShipDesign";
import { calculateAABB } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { cls, iMapOf, type Tile, tileToPoint } from "@spaceship-idle/shared/src/utils/Helper";
import { useState } from "react";
import { playClick } from "./Sound";

export function ShipBlueprintModal() {
   const [shipClass, setShipClass] = useState<ShipClass>(ShipClassList[0]);
   return (
      <div className="m10">
         <div className="row">
            <div className="f1 stretch">
               {ShipClassList.map((shipClass_) => (
                  <div
                     className={cls("pointer", shipClass_ === shipClass ? "text-space" : null)}
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
   const min = aabb.min;
   return (
      <div style={{ position: "relative", width, height }}>
         {iMapOf(layout, (tile) => {
            const { x, y } = tileToPoint(tile);
            return (
               <div
                  key={tile}
                  style={{
                     position: "absolute",
                     left: (x - min.x) * tileSize,
                     top: (y - min.y) * tileSize,
                     margin: (tileSize * MarginPercent) / 2,
                     width: tileSize * (1 - MarginPercent),
                     height: tileSize * (1 - MarginPercent),
                     borderRadius: 5,
                     border: "1px solid white",
                     opacity: highlight.has(tile) ? 0.75 : 0.25,
                  }}
               ></div>
            );
         })}
      </div>
   );
}
