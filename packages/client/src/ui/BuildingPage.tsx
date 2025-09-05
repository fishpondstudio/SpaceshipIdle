import { ColorInput } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { CodeLabel } from "@spaceship-idle/shared/src/game/definitions/CodeNumber";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { memo } from "react";
import { refreshOnTypedEvent } from "../utils/Hook";
import { AttackComp } from "./components/AttackComp";
import { DefenseComp } from "./components/DefenseComp";
import { FloatingTip } from "./components/FloatingTip";
import { SidebarComp } from "./components/SidebarComp";
import { StatusEffectComp } from "./components/StatusEffectComp";
import { TextureComp } from "./components/TextureComp";
import { TitleComp } from "./components/TitleComp";
import { UpgradeComp } from "./components/UpgradeComp";
import { VideoTutorialComp } from "./components/VideoTutorialComp";
import type { ITileWithGameState } from "./ITileWithGameState";

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
   return (
      <SidebarComp
         title={
            <FloatingTip label={codeLabel} disabled={codeLabel.length <= 0} position="left">
               <div className="row g5">
                  <TextureComp name={`Building/${data.type}`} style={{ margin: "-10px -5px" }} />
                  <div className="f1">{getBuildingName(data.type)}</div>
               </div>
            </FloatingTip>
         }
      >
         <div className="h10" />
         {readonly ? (
            <TitleComp>{t(L.LevelX, data.level)}</TitleComp>
         ) : (
            <>
               <UpgradeComp tile={tile} gs={gs} />
               <VideoTutorialComp tutorial="Move" className="mx10 mt10" />
               <VideoTutorialComp tutorial="Recycle" className="mx10 mt10" />
            </>
         )}
         <DefenseComp tile={tile} gs={gs} />
         <AttackComp tile={tile} gs={gs} />
         <StatusEffectComp tile={tile} gs={gs} />
         <div className="h10" />
      </SidebarComp>
   );
}
