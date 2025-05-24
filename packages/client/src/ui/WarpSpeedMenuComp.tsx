import { Menu, Tooltip } from "@mantine/core";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { classNames, formatNumber, range } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function WarpSpeedMenuComp({ gs }: { gs: GameState }): React.ReactNode {
   return (
      <Menu position="bottom-start">
         <Menu.Target>
            <Tooltip label={t(L.TimeWarpTooltip)}>
               <div className="col" style={{ width: 70 }}>
                  <TextureComp
                     id="ship-info-warp"
                     className={classNames(G.speed > 1 ? "spin" : null)}
                     style={{ animationDuration: `${8 / G.speed}s` }}
                     name="Misc/TimeWarp"
                     size={24}
                  />
                  <div>
                     {formatNumber(gs.resources.get("Warp") ?? 0)}/{formatNumber(G.speed)}x
                  </div>
               </div>
            </Tooltip>
         </Menu.Target>
         <Menu.Dropdown className="sf-frame">
            <Menu.Label>{t(L.WarpSpeed)}</Menu.Label>
            {range(1, 9).map((i) => {
               return (
                  <Menu.Item
                     key={i}
                     leftSection={
                        G.speed === i ? (
                           <div className="mi">check_box</div>
                        ) : (
                           <div className="mi">check_box_outline_blank</div>
                        )
                     }
                     rightSection={<div className="text-xs text-dimmed">({i - 1} warp/s)</div>}
                     onClick={() => {
                        playClick();
                        G.speed = i;
                        GameStateUpdated.emit();
                     }}
                  >
                     {i}x
                  </Menu.Item>
               );
            })}
         </Menu.Dropdown>
      </Menu>
   );
}
