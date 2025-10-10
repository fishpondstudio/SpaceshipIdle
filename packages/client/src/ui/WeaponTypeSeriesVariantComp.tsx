import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { CodeLabel } from "@spaceship-idle/shared/src/game/definitions/CodeNumber";
import { parseBuildingCode } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";

export function WeaponTypeSeriesVariantComp({ building }: { building: Building }): React.ReactNode {
   const def = Config.Buildings[building];
   const codeLabel = CodeLabel[def.code]();
   const { type, series, variant } = parseBuildingCode(building);
   return (
      <>
         <div className="row">
            <div className="f1">{t(L.Type)}</div>
            <div>
               {def.code} ({codeLabel})
            </div>
         </div>
         <div className="row">
            <div className="f1">{t(L.Series)}</div>
            <div>{series}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.Variant)}</div>
            <div>{variant ?? t(L.BaseVariant)}</div>
         </div>
      </>
   );
}
