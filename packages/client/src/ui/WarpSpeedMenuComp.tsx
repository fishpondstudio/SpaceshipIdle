import { Menu } from "@mantine/core";
import { WarpElementId } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { type GameState, GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getMaxTimeWarp, resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { cls, formatNumber, range, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo, useCallback } from "react";
import { G } from "../utils/Global";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function WarpSpeedMenuComp({ gs }: { gs: GameState }): React.ReactNode {
   const onSpeedChange = useCallback(
      (speed: number) => {
         if (speed > 1) {
            gs.flags = setFlag(gs.flags, GameStateFlags.UsedWarp);
         }
         G.speed = speed;
         GameStateUpdated.emit();
      },
      [gs],
   );
   const warp = resourceOf("Warp", gs.resources).current;
   return (
      <Menu position="bottom-start">
         <FloatingTip
            label={
               <>
                  {html(t(L.TimeWarpTooltipHTML, formatNumber(G.speed), formatNumber(warp)))}
                  <div className="divider mx-10 my5"></div>
                  <MaxTimeWarpComp gs={gs} />
               </>
            }
         >
            <Menu.Target>
               <div className="block pointer" style={{ width: 85 }}>
                  <TextureComp
                     id={WarpElementId}
                     className={cls(G.speed > 1 ? "spin" : null)}
                     style={{ animationDuration: `${8 / G.speed}s` }}
                     name="Others/Warp"
                     width={24}
                  />
                  <div className="f1 text-right">
                     <div>{formatNumber(G.speed)}x</div>
                     <div className="xs">{formatNumber(warp)}</div>
                  </div>
               </div>
            </Menu.Target>
         </FloatingTip>
         <WarpMenu speed={G.speed} onSpeedChange={onSpeedChange} />
      </Menu>
   );
}

export function MaxTimeWarpComp({ gs }: { gs: GameState }): React.ReactNode {
   const [max, breakdown] = getMaxTimeWarp(gs);
   return (
      <>
         <div className="row">
            <div className="f1">{t(L.MaxTimeWarp)}</div>
            <div>{t(L.XHourShort, formatNumber(max))}</div>
         </div>
         <div className="text-xs text-space">
            {breakdown.map((b) => (
               <div key={b.label}>
                  - {b.label}: {t(L.XHourShort, formatNumber(b.value))}
               </div>
            ))}
         </div>
      </>
   );
}

function _WarpMenu({
   speed,
   onSpeedChange,
}: {
   speed: number;
   onSpeedChange: (speed: number) => void;
}): React.ReactNode {
   return (
      <Menu.Dropdown className="sf-frame">
         <Menu.Label>{t(L.WarpSpeed)}</Menu.Label>
         {range(1, 9).map((i) => {
            return (
               <Menu.Item
                  key={i}
                  leftSection={
                     speed === i ? (
                        <div className="mi">check_box</div>
                     ) : (
                        <div className="mi">check_box_outline_blank</div>
                     )
                  }
                  rightSection={
                     <div className="text-xs text-dimmed">
                        ({i - 1} {t(L.WarpPerSec)})
                     </div>
                  }
                  onClick={() => {
                     playClick();
                     onSpeedChange(i);
                  }}
               >
                  {i}x
               </Menu.Item>
            );
         })}
      </Menu.Dropdown>
   );
}

export const WarpMenu = memo(_WarpMenu, (prev, next) => {
   return prev.speed === next.speed;
});
