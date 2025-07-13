import { CloseButton, ScrollArea } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useEffect } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { AttackComp } from "./components/AttackComp";
import { DefenseComp } from "./components/DefenseComp";
import { StatusEffectComp } from "./components/StatusEffectComp";
import { TitleComp } from "./components/TitleComp";
import type { ITileWithGameState } from "./ITileWithGameState";
import { SetPopover } from "./PopoverHelper";

export function BuildingPopover({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   const handle = refreshOnTypedEvent(GameStateUpdated);

   // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
   useEffect(() => {
      if (G.runtime.battleType === BattleType.Peace || !gs.tiles.has(tile)) {
         SetPopover.emit(undefined);
      }
   }, [handle]);

   if (!data) {
      return null;
   }

   return (
      <>
         <div className="row mr5 ml10" style={{ height: 35 }}>
            <div>{Config.Buildings[data.type].name()}</div>
            <div className="f1" />
            <CloseButton size="sm" onClick={() => SetPopover.emit(undefined)} />
         </div>
         <div className="divider" />
         <ScrollArea.Autosize scrollbars="y" style={{ height: 400 - 35 - 1 }}>
            <div className="h10" />
            <TitleComp>{t(L.LevelX, data.level)}</TitleComp>
            <DefenseComp tile={tile} gs={gs} />
            <AttackComp tile={tile} gs={gs} />
            <StatusEffectComp tile={tile} gs={gs} />
            <div className="h10" />
         </ScrollArea.Autosize>
      </>
   );
}
