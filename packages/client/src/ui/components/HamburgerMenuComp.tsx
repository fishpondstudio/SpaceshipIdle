import { Menu } from "@mantine/core";
import { PatchNotesUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { openUrl } from "../../rpc/SteamClient";
import { OnLanguageChanged } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { showModal } from "../../utils/ToggleModal";
import { AlertPage } from "../AlertPage";
import { GameSettingsModal } from "../GameSettingsModal";
import { PlayerProfileModal } from "../PlayerProfileModal";
import { PrestigeModal } from "../PrestigeModal";
import { PrestigeReason } from "../PrestigeReason";
import { ShipBlueprintModal } from "../ShipBlueprintModal";
import { setSidebar } from "../Sidebar";
import { WeaponListModal } from "../WeaponListModal";
import { TextureComp } from "./TextureComp";

export function _HamburgerMenuComp(): React.ReactNode {
   refreshOnTypedEvent(OnLanguageChanged);
   return (
      <Menu position="bottom-start">
         <Menu.Target>
            <div className="cc pointer" style={{ width: 44 }}>
               <TextureComp name="Others/Menu24" />
            </div>
         </Menu.Target>
         <Menu.Dropdown className="sf-frame">
            <Menu.Item
               leftSection={<div className="mi">published_with_changes</div>}
               onClick={() => {
                  showModal({
                     title: t(L.Prestige),
                     children: <PrestigeModal reason={PrestigeReason.None} />,
                     size: "sm",
                     dismiss: true,
                  });
               }}
            >
               {t(L.Prestige)}
            </Menu.Item>
            <Menu.Item
               leftSection={<div className="mi">grid_view</div>}
               onClick={() => {
                  showModal({
                     children: <ShipBlueprintModal />,
                     title: t(L.ShipBlueprint),
                     size: "lg",
                     dismiss: true,
                  });
               }}
            >
               {t(L.ShipBlueprint)}
            </Menu.Item>
            <Menu.Item
               leftSection={<div className="mi">event_note</div>}
               onClick={() => {
                  setSidebar(<AlertPage />);
               }}
            >
               {t(L.EventLog)}
            </Menu.Item>
            <Menu.Item
               leftSection={<div className="mi">menu_book</div>}
               onClick={() => {
                  showModal({
                     children: <WeaponListModal />,
                     title: t(L.WeaponList),
                     size: "xl",
                     dismiss: true,
                  });
               }}
            >
               {t(L.WeaponList)}
            </Menu.Item>
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
                  openUrl(PatchNotesUrl);
               }}
            >
               {t(L.PatchNotes)}
            </Menu.Item>
         </Menu.Dropdown>
      </Menu>
   );
}

export const HamburgerMenuComp = memo(_HamburgerMenuComp);
