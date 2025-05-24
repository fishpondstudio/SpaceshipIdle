import { Box, Select, Slider, Switch, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { Languages } from "@spaceship-idle/shared/src/game/Languages";
import { clearFlag, hasFlag, mapOf, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { resetGame } from "../game/LoadSave";
import { getVersion } from "../game/Version";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { RenderHTML } from "./components/RenderHTMLComp";

export function GameSettingsModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <>
         <div className="row mb10">
            <div className="mi">translate</div>
            <div className="f1"></div>
            <Select
               value={G.save.options.language}
               data={mapOf(Languages, (lang, content) => ({ label: content.$Language, value: lang }))}
               onChange={(lang) => {
                  if (lang) {
                     G.save.options.language = lang as keyof typeof Languages;
                     Object.assign(L, Languages[G.save.options.language]);
                     notifications.show({
                        message: t(L.LanguageChangeWarning),
                        position: "top-center",
                        color: "yellow",
                        withBorder: true,
                     });
                     GameOptionUpdated.emit();
                  }
               }}
            />
         </div>
         <div className="row mb10">
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
         <div className="row mb10">
            {t(L.SoundVolume)}
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
         </div>
         <div className="10"></div>
         <div className="divider my10 mx-10" />
         <Box flex={1} fz="sm" c="dimmed" ta="center" tt="uppercase">
            <RenderHTML html={t(L.VersionNumber, getVersion())} />
         </Box>
      </>
   );
}
