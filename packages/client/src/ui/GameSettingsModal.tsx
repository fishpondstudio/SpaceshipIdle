import { Input, noop, SegmentedControl, Slider, Switch, Tooltip } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DiscordUrl, SteamUrl, TranslationUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateFlags, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getShortcutKey, isShortcutEqual, makeShortcut, Shortcut } from "@spaceship-idle/shared/src/game/Shortcut";
import { clearFlag, forEach, hasFlag, mapOf, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import MouseControl from "../assets/images/MouseControl.png";
import { loadGameStateFromFile, resetGame, saveGame, saveGameStateToFile } from "../game/LoadSave";
import { getVersion } from "../game/Version";
import { RPCClient } from "../rpc/RPCClient";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { DevOrAdminOnly } from "./components/DevOnly";
import { RenderHTML } from "./components/RenderHTMLComp";
import { playError } from "./Sound";
import { ViewShipModal } from "./ViewShipModal";

interface TabContent {
   content: () => React.ReactNode;
   name: () => string;
}

const Tabs = {
   General: { name: () => t(L.TabGeneral), content: () => <GeneralTab /> },
   Shortcut: { name: () => t(L.TabControl), content: () => <ShortcutTab /> },
} as const satisfies Record<string, TabContent>;

type Tab = keyof typeof Tabs;

export function GameSettingsModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   refreshOnTypedEvent(GameStateUpdated);
   const [tab, setTab] = useState<Tab>("General");
   return (
      <>
         <SegmentedControl
            className="p5 w100"
            style={{ background: "transparent" }}
            data={mapOf(Tabs as Record<string, TabContent>, (k, v) => ({ label: v.name(), value: k }))}
            onChange={(value) => setTab(value as Tab)}
            value={tab}
         />
         <div className="divider" />
         <div className="m10">{Tabs[tab].content()}</div>
      </>
   );
}

function GeneralTab(): React.ReactNode {
   return (
      <>
         <ChangeLanguageComp />
         <div className="row g5 text-sm text-space mt10 fstart pointer" onClick={() => openUrl(TranslationUrl)}>
            <div className="mi sm">open_in_new</div>
            <div>{t(L.HelpImproveTranslation)}</div>
         </div>
         <div className="divider my10 mx-10" />
         <div className="row">
            <div>{t(L.ShowResources)}</div>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.ShowResources)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.ShowResources)
                     : clearFlag(G.save.options.flag, GameOptionFlag.ShowResources);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="h10" />
         <div className="row">
            <div>{t(L.HideInactiveResources)}</div>
            <Tooltip.Floating label={t(L.HideInactiveResourcesTooltip)}>
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.HideInactiveResources)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.HideInactiveResources)
                     : clearFlag(G.save.options.flag, GameOptionFlag.HideInactiveResources);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="h10" />
         <div className="row">
            <div>{t(L.TheoreticalValue)}</div>
            <Tooltip.Floating label={t(L.TheoreticalValueTooltip)}>
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.TheoreticalValue)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.TheoreticalValue)
                     : clearFlag(G.save.options.flag, GameOptionFlag.TheoreticalValue);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="h10" />
         <div className="row">
            <div>{t(L.CooldownIndicatorOutsideBattle)}</div>
            <Tooltip.Floating label={t(L.CooldownIndicatorOutsideBattleTooltip)}>
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.CooldownIndicatorOutsideBattle)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.CooldownIndicatorOutsideBattle)
                     : clearFlag(G.save.options.flag, GameOptionFlag.CooldownIndicatorOutsideBattle);
                  GameOptionUpdated.emit();
               }}
            />
         </div>{" "}
         <div className="h10" />
         <div className="row">
            <div>{t(L.LinearCooldownIndicator)}</div>
            <Tooltip.Floating label={t(L.LinearCooldownIndicatorTooltip)}>
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
            <div className="f1" />
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.LinearCooldownIndicator)}
               onChange={(e) => {
                  G.save.options.flag = e.target.checked
                     ? setFlag(G.save.options.flag, GameOptionFlag.LinearCooldownIndicator)
                     : clearFlag(G.save.options.flag, GameOptionFlag.LinearCooldownIndicator);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="divider my10 mx-10" />
         <div className="row">
            <div>{t(L.RetroFilter)}</div>
            <Tooltip.Floating label={t(L.RequireGameRestart)}>
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
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
            <div>{t(L.NebulaStrength)}</div>
            <Tooltip.Floating label={t(L.NebulaStrengthTooltip)}>
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
            <div className="f1" />
            <Slider
               w="50%"
               value={G.save.options.nebulaStrength}
               onChange={(v) => {
                  G.save.options.nebulaStrength = v;
                  GameOptionUpdated.emit();
               }}
               min={0}
               max={1}
               step={0.1}
            />
         </div>
         <div className="h10"></div>
         <div className="row">
            <div>{t(L.SoundVolume)}</div>
            <div className="f1" />
            <Slider
               w="50%"
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
               checked={hasFlag(G.save.state.flags, GameStateFlags.ShowTutorial)}
               onChange={(e) => {
                  G.save.state.flags = e.target.checked
                     ? setFlag(G.save.state.flags, GameStateFlags.ShowTutorial)
                     : clearFlag(G.save.state.flags, GameStateFlags.ShowTutorial);
                  GameStateUpdated.emit();
               }}
            />
         </div>
         <div className="h10" />
         <div className="row">
            <div>{t(L.HideSteamIcon)}</div>
            <div className="mi sm text-space pointer" onClick={() => openUrl(SteamUrl)}>
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
            <div>{t(L.HideDiscordIcon)}</div>
            <div className="mi sm text-space pointer" onClick={() => openUrl(DiscordUrl)}>
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
                  saveGameStateToFile(G.save.state);
               }}
            >
               {t(L.ExportSpaceship)}
            </button>
         </div>
         <DevOrAdminOnly>
            <>
               <div className="divider my10 mx-10" />
               <div className="row text-sm">
                  <button
                     className="btn f1"
                     onClick={async () => {
                        try {
                           G.save.state = await loadGameStateFromFile();
                           await saveGame(G.save);
                           window.location.reload();
                        } catch (e) {
                           playError();
                           notifications.show({ position: "top-center", color: "red", message: String(e) });
                        }
                     }}
                  >
                     Load
                  </button>
                  <button
                     className="btn f1"
                     onClick={() => {
                        saveGameStateToFile(G.save.state);
                     }}
                  >
                     Export
                  </button>
                  <button
                     className="btn f1"
                     onClick={async () => {
                        try {
                           const ship = await loadGameStateFromFile();
                           const id = await RPCClient.saveShipV2(ship);
                           showModal({
                              title: t(L.ViewShip),
                              children: <ViewShipModal id={id} />,
                              size: "md",
                              dismiss: true,
                           });
                        } catch (e) {
                           playError();
                           notifications.show({ position: "top-center", color: "red", message: String(e) });
                        }
                     }}
                  >
                     Set Baseline
                  </button>
               </div>
            </>
         </DevOrAdminOnly>
         <div className="divider my10 mx-10" />
         <div className="text-center text-sm text-dimmed">
            <RenderHTML html={t(L.VersionNumber, getVersion())} />
         </div>
      </>
   );
}

function ShortcutTab(): React.ReactNode {
   const forceUpdate = useForceUpdate();
   return (
      <>
         <div className="text-dimmed panel p5 text-sm row">
            <img className="br5" src={MouseControl} style={{ width: 180 }} />
            <div>
               <RenderHTML className="render-html" html={t(L.TutorialAdvancedGameControlContent)} />
               <div className="h10" />
               <RenderHTML className="render-html" html={t(L.AdvancedGameControlContent)} />
            </div>
         </div>
         {mapOf(G.save.options.shortcuts, (shortcut, config) => (
            <div className="row my10" key={shortcut}>
               <div className="f1">{Shortcut[shortcut]()}</div>
               <Input
                  classNames={{ wrapper: "f1", input: "text-right" }}
                  value={getShortcutKey(config)}
                  onChange={noop}
                  onKeyDown={(e) => {
                     e.preventDefault();
                     if (
                        (e.ctrlKey && e.key === "Control") ||
                        (e.shiftKey && e.key === "Shift") ||
                        (e.altKey && e.key === "Alt") ||
                        (e.metaKey && e.key === "Meta")
                     ) {
                        return;
                     }
                     const config = makeShortcut(e);
                     forEach(G.save.options.shortcuts, (k, cfg) => {
                        if (isShortcutEqual(cfg, config)) {
                           G.save.options.shortcuts[k] = {
                              ctrl: false,
                              shift: false,
                              alt: false,
                              meta: false,
                              key: "",
                           };
                        }
                     });
                     G.save.options.shortcuts[shortcut] = config;
                     (e.target as HTMLInputElement).value = getShortcutKey(config);
                     GameOptionUpdated.emit();
                     forceUpdate();
                  }}
               />
            </div>
         ))}
      </>
   );
}
