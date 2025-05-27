import { Box, Slider, Switch, Tooltip } from "@mantine/core";
import { DiscordUrl, SteamUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { clearFlag, hasFlag, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { resetGame, saveGameStateToFile } from "../game/LoadSave";
import { getVersion } from "../game/Version";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { RenderHTML } from "./components/RenderHTMLComp";

export function GameSettingsModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <>
         <ChangeLanguageComp />
         <div className="divider my10 mx-10" />
         <div className="row">
            {t(L.RetroFilter)}
            <Tooltip label={t(L.RequireGameRestart)}>
               <div className="mi text-space">info</div>
            </Tooltip>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.RetroFilter)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.RetroFilter)
                     : clearFlag(G.save.options.flag, GameOptionFlag.RetroFilter);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="h10"></div>
         <div className="row">
            <div className="f1">{t(L.SoundVolume)}</div>
            <Slider
               flex={1}
               value={G.save.options.volume}
               onChange={(v) => {
                  G.save.options.volume = v;
                  GameOptionUpdated.emit();
               }}
               min={0}
               max={1}
               step={0.1}
            />
         </div>
         <div className="h10"></div>
         <div className="row">
            <div className="f1">{t(L.ShowTutorial)}</div>
            <Switch
               checked={hasFlag(G.save.current.flags, GameStateFlags.ShowTutorial)}
               onChange={(e) => {
                  G.save.current.flags = e.target.checked
                     ? setFlag(G.save.current.flags, GameStateFlags.ShowTutorial)
                     : clearFlag(G.save.current.flags, GameStateFlags.ShowTutorial);
                  GameStateUpdated.emit();
               }}
            />
         </div>
         <div className="h10" />
         <div className="row">
            {t(L.HideSteamIcon)}
            <div className="mi text-space pointer" onClick={() => openUrl(SteamUrl)}>
               open_in_new
            </div>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.HideSteamIcon)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.HideSteamIcon)
                     : clearFlag(G.save.options.flag, GameOptionFlag.HideSteamIcon);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="h10" />
         <div className="row">
            {t(L.HideDiscordIcon)}
            <div className="mi text-space pointer" onClick={() => openUrl(DiscordUrl)}>
               open_in_new
            </div>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.HideDiscordIcon)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.HideDiscordIcon)
                     : clearFlag(G.save.options.flag, GameOptionFlag.HideDiscordIcon);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="divider dashed my10 mx-10" />
         <div className="row">
            <div className="f1">{t(L.HardReset)}</div>
            <button
               className="btn red text-sm"
               onClick={async () => {
                  await resetGame();
                  window.location.reload();
               }}
            >
               {t(L.HardReset)}
            </button>
            <button
               className="btn text-sm"
               onClick={() => {
                  saveGameStateToFile(G.save.current);
               }}
            >
               {t(L.ExportSpaceship)}
            </button>
         </div>
         <div className="divider my10 mx-10" />
         <Box flex={1} fz="sm" c="dimmed" ta="center" tt="uppercase">
            <RenderHTML html={t(L.VersionNumber, getVersion())} />
         </Box>
      </>
   );
}
