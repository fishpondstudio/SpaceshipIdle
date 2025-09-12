import { NumberInput, Select } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { Blueprints } from "@spaceship-idle/shared/src/game/definitions/Blueprints";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { type ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import type { Tech } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { getDamagePerFire, getTotalBuildingCost } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { quantumToElement, xpToQuantum } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { getTechInShipClass, getTechShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatHMS, formatNumber, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { useState } from "react";

export function BalancingModal(): React.ReactNode {
   const [shipClass, setShipClass] = useState<ShipClass>(ShipClassList[0]);
   const [level, setLevel] = useState<number>(1);
   const totalModules = Blueprints.Odyssey.blueprint[shipClass].length;
   const building = getBuildingForShipClass(shipClass);
   const costPerModule = getTotalBuildingCost(building, 0, level);
   const xpPerSecPerModule =
      getDamagePerFire({ type: building, level: level }) / Config.Buildings[building].fireCooldown;
   const totalCost = costPerModule * totalModules;
   const quantum = xpToQuantum(totalCost);
   return (
      <div className="m10">
         <div className="row">
            <Select
               className="f1"
               data={ShipClassList}
               value={shipClass}
               onChange={(value) => setShipClass(value as ShipClass)}
               checkIconPosition="right"
               allowDeselect={false}
            />
            <NumberInput
               className="f1"
               value={level}
               min={1}
               max={100}
               onChange={(value) => setLevel(Number.parseInt(value as string, 10))}
            />
         </div>
         <div className="h10" />
         <div className="panel">
            <div className="row">
               <div className="f1">Total Modules</div>
               <div>{totalModules}</div>
            </div>
            <div className="row">
               <div className="f1">Cost Per Module</div>
               <div>{formatNumber(costPerModule)}</div>
            </div>
            <div className="row">
               <div className="f1">Total Cost</div>
               <div>{formatNumber(totalCost)}</div>
            </div>
            <div className="row">
               <div className="f1">XP/s For Each Module</div>
               <div>{formatNumber(xpPerSecPerModule)}</div>
            </div>
            <div className="row">
               <div className="f1">Total XP/s</div>
               <div>{formatNumber(xpPerSecPerModule * totalModules)}</div>
            </div>
            <div className="row">
               <div className="f1">Time To Total Cost</div>
               <div>{formatHMS((totalCost / (xpPerSecPerModule * totalModules)) * SECOND)}</div>
            </div>
            <div className="row">
               <div className="f1">Required Quantum</div>
               <div>{getTechInShipClass(shipClass).length + totalModules}</div>
            </div>
            <div className="row">
               <div className="f1">Quantum</div>
               <div>{quantum}</div>
            </div>
            <div className="row">
               <div className="f1">Element</div>
               <div>{quantumToElement(quantum)}</div>
            </div>
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
