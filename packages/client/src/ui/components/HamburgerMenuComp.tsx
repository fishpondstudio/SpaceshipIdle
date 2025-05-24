import { Menu, Tooltip } from "@mantine/core";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { clearFlag, hasFlag, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { G } from "../../utils/Global";
import { showModal } from "../../utils/ToggleModal";
import { GameSettingsModal } from "../GameSettingsModal";
import { PatchNotesModal } from "../PatchNotesModal";
import { PlayerProfileModal } from "../PlayerProfileModal";
import { ShipGalleryModal } from "../ShipGalleryModal";

export function _HamburgerMenuComp({ flag }: { flag: GameOptionFlag }): React.ReactNode {
   return (
      <Menu position="bottom-start">
         <Menu.Target>
            <div className="cc" style={{ width: 40, alignSelf: "stretch" }}>
               <div className="mi lg">menu</div>
            </div>
         </Menu.Target>
         <Menu.Dropdown className="sf-frame">
            <Menu.Item
               leftSection={
                  hasFlag(flag, GameOptionFlag.ShowResources) ? (
                     <div className="mi">check_box</div>
                  ) : (
                     <div className="mi">check_box_outline_blank</div>
                  )
               }
               onClick={() => {
                  G.save.options.flag = hasFlag(flag, GameOptionFlag.ShowResources)
                     ? clearFlag(flag, GameOptionFlag.ShowResources)
                     : setFlag(flag, GameOptionFlag.ShowResources);
                  GameOptionUpdated.emit();
               }}
            >
               {t(L.ShowResources)}
            </Menu.Item>
            <Tooltip label={t(L.TheoreticalValueTooltip)}>
               <Menu.Item
                  leftSection={
                     hasFlag(flag, GameOptionFlag.TheoreticalValue) ? (
                        <div className="mi">check_box</div>
                     ) : (
                        <div className="mi">check_box_outline_blank</div>
                     )
                  }
                  onClick={() => {
                     G.save.options.flag = hasFlag(flag, GameOptionFlag.TheoreticalValue)
                        ? clearFlag(flag, GameOptionFlag.TheoreticalValue)
                        : setFlag(flag, GameOptionFlag.TheoreticalValue);
                     GameOptionUpdated.emit();
                  }}
               >
                  {t(L.TheoreticalValue)}
               </Menu.Item>
            </Tooltip>
            <Menu.Item
               leftSection={<div className="mi">person</div>}
               onClick={() => {
                  showModal({
                     children: <PlayerProfileModal />,
                     title: t(L.PlayerProfile),
                     size: "md",
                     dismiss: true,
                  });
               }}
            >
               {t(L.PlayerProfile)}
            </Menu.Item>
            <Menu.Item
               leftSection={<div className="mi">grid_view</div>}
               onClick={() => {
                  showModal({
                     children: <ShipGalleryModal />,
                     title: t(L.ShipGallery),
                     size: "xl",
                     dismiss: true,
                  });
               }}
            >
               {t(L.ShipGallery)}
            </Menu.Item>
            <Menu.Item
               leftSection={<div className="mi">settings</div>}
               onClick={() => {
                  showModal({
                     children: <GameSettingsModal />,
                     title: t(L.GameSettings),
                     size: "md",
                     dismiss: true,
                  });
               }}
            >
               {t(L.GameSettings)}
            </Menu.Item>
            <Menu.Item
               leftSection={<div className="mi">article</div>}
               onClick={() => {
                  showModal({
                     children: <PatchNotesModal />,
                     title: t(L.PatchNotes),
                     size: "md",
                     dismiss: true,
                  });
               }}
            >
               {t(L.PatchNotes)}
            </Menu.Item>
         </Menu.Dropdown>
      </Menu>
   );
}

export const HamburgerMenuComp = memo(_HamburgerMenuComp, (prev, next) => {
   return prev.flag === next.flag;
});
