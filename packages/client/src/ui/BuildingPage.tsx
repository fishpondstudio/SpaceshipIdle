import { ColorInput, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { CodeLabel } from "@spaceship-idle/shared/src/game/definitions/CodeNumber";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { memo, useCallback } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import type { ITileWithGameState } from "./ITileWithGameState";
import { AttackComp } from "./components/AttackComp";
import { DefenseComp } from "./components/DefenseComp";
import { ProductionComp } from "./components/ProductionComp";
import { SidebarComp } from "./components/SidebarComp";
import { StatusEffectComp } from "./components/StatusEffectComp";
import { TitleComp } from "./components/TitleComp";
import { UpgradeComp } from "./components/UpgradeComp";

const ColorInput_ = memo(ColorInput, (oldProps, newProps) => {
   return oldProps.value === newProps.value && oldProps.onChangeEnd === newProps.onChangeEnd;
});

export function BuildingPage({ tile, gs, readonly }: ITileWithGameState & { readonly: boolean }): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const def = Config.Buildings[data?.type];
   const codeLabel = CodeLabel[def.code]();
   const changeColor = useCallback(
      (value: string) => {
         G.save.options.buildingColors.set(data.type, Number.parseInt(value.substring(1), 16));
         GameOptionUpdated.emit();
      },
      [data.type],
   );
   return (
      <SidebarComp
         title={
            <Tooltip label={codeLabel} disabled={codeLabel.length <= 0} position="left">
               <div>{def.name()}</div>
            </Tooltip>
         }
      >
         <div className="h10" />
         {!readonly ? (
            <>
               <UpgradeComp tile={tile} gs={gs} />
            </>
         ) : (
            <>
               <TitleComp>{t(L.LevelX, data.level)}</TitleComp>
            </>
         )}
         <ProductionComp tile={tile} gs={gs} />
         <DefenseComp tile={tile} gs={gs} />
         <AttackComp tile={tile} gs={gs} />
         <StatusEffectComp tile={tile} gs={gs} />
         <div className="divider my10" />
         <div className="mx10">
            <ColorInput_
               value={`#${(G.save.options.buildingColors.get(data.type) ?? 0xffffff).toString(16)}`}
               onChangeEnd={changeColor}
            />
         </div>
         <div className="h10" />
      </SidebarComp>
   );
}
