import { NumberInput, Select } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { Blueprints } from "@spaceship-idle/shared/src/game/definitions/Blueprints";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { type ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import type { Tech } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { getDamagePerFire, getTotalBuildingCost } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { elementToXP, xpToQuantum } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { getTechShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatHMS, formatNumber, range, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { useState } from "react";

export function BalancingModal(): React.ReactNode {
   const [shipClass, setShipClass] = useState<ShipClass>(ShipClassList[0]);
   const [elementFactor, setElementFactor] = useState<number>(0.25);
   const [permanentElementFactor, setPermanentElementFactor] = useState<number>(0);
   const [catalystFactor, setCatalystFactor] = useState<number>(0.5);
   const [addonFactor, setAddonFactor] = useState<number>(0.1);
   const totalModules = Blueprints.Odyssey.blueprint[shipClass].length;
   const building = getBuildingForShipClass(shipClass);
   return (
      <div className="m10">
         <div className="row">
            <Select
               label="Ship Class"
               flex={2}
               data={ShipClassList}
               value={shipClass}
               onChange={(value) => {
                  const shipClass = value as ShipClass;
                  setShipClass(shipClass);
                  setPermanentElementFactor(ShipClassList.indexOf(shipClass) + 1);
               }}
               checkIconPosition="right"
               allowDeselect={false}
            />
            <NumberInput
               label="Element"
               flex={1}
               value={elementFactor}
               min={0}
               max={100}
               onChange={(value) => setElementFactor(Number.parseFloat(value as string))}
            />
            <NumberInput
               label="P. Element"
               flex={1}
               value={permanentElementFactor}
               min={0}
               max={100}
               onChange={(value) => setPermanentElementFactor(Number.parseFloat(value as string))}
            />
            <NumberInput
               label="Catalyst"
               flex={1}
               value={catalystFactor}
               min={0}
               max={100}
               onChange={(value) => setCatalystFactor(Number.parseFloat(value as string))}
            />
            <NumberInput
               label="Addon"
               flex={1}
               value={addonFactor}
               min={0}
               max={100}
               onChange={(value) => setAddonFactor(Number.parseFloat(value as string))}
            />
         </div>
         <div className="h10" />
         <div className="panel">
            <div className="row">
               <div className="f1">Total Modules</div>
               <div>{totalModules}</div>
            </div>
         </div>
         <div className="h10" />
         <div className="panel p0">
            <table className="data-table text-center">
               <thead>
                  <tr>
                     <th>Element</th>
                     <th>Modules</th>
                     <th>XP</th>
                     <th>Level</th>
                     <th>Multi</th>
                     <th>XP/s</th>
                     <th>Time</th>
                  </tr>
               </thead>
               <tbody>
                  {range(1, 51).map((i) => {
                     const totalXP = elementToXP(i);
                     const modules = Math.min(Math.round(xpToQuantum(totalXP)), totalModules);
                     const level = getBuildingLevelForXP(building, totalXP / modules);
                     const xpPerSec =
                        (modules * getDamagePerFire({ type: building, level: level })) /
                        Config.Buildings[building].fireCooldown;
                     const multipliers =
                        1 +
                        permanentElementFactor +
                        i * elementFactor +
                        (ShipClassList.indexOf(shipClass) + 1) * catalystFactor +
                        addonFactor;
                     return (
                        <tr key={i}>
                           <td>{i}</td>
                           <td>{modules}</td>
                           <td>{formatNumber(totalXP)}</td>
                           <td>{level}</td>
                           <td>{formatNumber(multipliers)}</td>
                           <td>{formatNumber(xpPerSec * multipliers)}</td>
                           <td>{formatHMS((totalXP / (xpPerSec * multipliers)) * SECOND)}</td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
   );
}

function getBuildingForShipClass(shipClass: ShipClass): Building {
   let tech: Tech;
   for (tech in Config.Tech) {
      const def = Config.Tech[tech];
      if (getTechShipClass(tech) === shipClass && def.unlockBuildings) {
         return def.unlockBuildings[0];
      }
   }
   throw new Error(`No building found for ship class ${shipClass}`);
}

function getBuildingLevelForXP(building: Building, xp: number): number {
   let level = 1;
   while (getTotalBuildingCost(building, 0, level) < xp) {
      level++;
   }
   return level - 1;
}
