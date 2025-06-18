import { Menu, Tooltip } from "@mantine/core";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { classNames, formatNumber, range } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo, useCallback } from "react";
import { G } from "../utils/Global";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function WarpSpeedMenuComp({ gs }: { gs: GameState }): React.ReactNode {
   const onSpeedChange = useCallback((speed: number) => {
      G.speed = speed;
      GameStateUpdated.emit();
   }, []);
   return (
      <Menu position="bottom-start">
         <Menu.Target>
            <Tooltip label={t(L.TimeWarpTooltip)}>
               <div className="block pointer" style={{ width: 80 }}>
                  <TextureComp
                     id="ship-info-warp"
                     className={classNames(G.speed > 1 ? "spin" : null)}
                     style={{ animationDuration: `${8 / G.speed}s` }}
                     name="Misc/TimeWarp"
                     width={24}
                  />
                  <div className="f1 text-right">
                     <div>{formatNumber(G.speed)}x</div>
                     <div className="xs">{formatNumber(gs.resources.get("Warp") ?? 0)}</div>
                  </div>
               </div>
            </Tooltip>
         </Menu.Target>
         <WarpMenu speed={G.speed} onSpeedChange={onSpeedChange} />
      </Menu>
   );
}

function _WarpMenu({
   speed,
   onSpeedChange,
}: { speed: number; onSpeedChange: (speed: number) => void }): React.ReactNode {
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
