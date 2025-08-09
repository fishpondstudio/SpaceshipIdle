import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageType } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { DiscordUrl, SteamUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { elementToXP, xpToElement } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { getUsedQuantum, quantumToXP, xpToQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { isQualifierBattle } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import {
   clamp,
   classNames,
   formatHMS,
   formatNumber,
   formatPercent,
   mathSign,
   mMapOf,
   mReduceOf,
   reduceOf,
} from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import Discord from "../../src/assets/images/Discord.svg";
import Steam from "../../src/assets/images/Steam.svg";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { HamburgerMenuComp } from "./components/HamburgerMenuComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { XPIcon } from "./components/SVGIcons";
import { TextureComp } from "./components/TextureComp";
import { PrepareForBattleModal } from "./PrepareForBattleModal";
import { PrepareForBattleMode } from "./PrepareForBattleMode";
import { QuantumProgressModal } from "./QuantumProgressModal";
import { playBling } from "./Sound";
import { WarpSpeedMenuComp } from "./WarpSpeedMenuComp";

const rawDamages: Record<DamageType, number> = {
   [DamageType.Kinetic]: 0,
   [DamageType.Explosive]: 0,
   [DamageType.Energy]: 0,
};
const actualDamages: Record<DamageType, number> = {
   [DamageType.Kinetic]: 0,
   [DamageType.Explosive]: 0,
   [DamageType.Energy]: 0,
};

export function ShipInfoPanel(): React.ReactNode {
   const state = G.save.current;
   const options = G.save.options;
   G.runtime.rightStat.averageRawDamage(10, rawDamages);
   G.runtime.rightStat.averageActualDamage(10, actualDamages);
   const usedQuantum = getUsedQuantum(state);
   const xpDelta = G.runtime.leftStat.averageResourceDelta("XP", 60);
   const highlight = isQualifierBattle(state);
   const currentXP = state.resources.get("XP") ?? 0;

   const quantum = xpToQuantum(currentXP);
   const nextQuantum = quantum + 1;
   const nextQuantumXP = quantumToXP(nextQuantum);
   const prevQuantumXP = quantumToXP(quantum);

   const element = xpToElement(currentXP);
   const nextElement = element + 1;
   const nextElementXP = elementToXP(nextElement);
   const prevElementXP = elementToXP(element);

   return (
      <div className="sf-frame top ship-info">
         <HamburgerMenuComp flag={options.flag} />
         <div className="divider vertical" />
         <Tooltip
            label={
               <>
                  <RenderHTML html={t(L.Battle)} />
                  {highlight ? <RenderHTML html={t(L.ReachedQuantumLimitV2, formatNumber(quantum))} /> : null}
               </>
            }
            multiline
            maw="30vw"
         >
            <div
               className="block pointer"
               onClick={() => {
                  showModal({
                     children: <PrepareForBattleModal mode={PrepareForBattleMode.Normal} />,
                     size: "sm",
                     dismiss: true,
                  });
               }}
            >
               <div style={{ fontSize: 26 }} className={classNames("mi", highlight ? "breathing" : null)}>
                  swords
               </div>
            </div>
         </Tooltip>
         <div className="divider vertical" />
         <Tooltip multiline maw="30vw" label={<RenderHTML html={t(L.XPTooltipHTML)} />}>
            <div className="block" style={{ width: 85 }}>
               <XPIcon />
               <div className="f1 text-right">
                  <div>{formatNumber((state.resources.get("XP") ?? 0) - (state.resources.get("XPUsed") ?? 0))}</div>
                  <div
                     className="xs"
                     style={{
                        color: xpDelta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                     }}
                  >
                     {mathSign(xpDelta)}
                     {formatNumber(Math.abs(xpDelta))}
                  </div>
               </div>
            </div>
         </Tooltip>
         <div className="divider vertical" />
         <div className="block" style={{ width: 85 }}>
            <div className="mi">security</div>
            <TextureComp name="Others/HP" />
            <div className="f1 text-right">
               <div>{formatNumber(G.runtime.leftStat.maxHp)}</div>
               <div className="xs">{formatNumber(G.save.current.tiles.size)}</div>
            </div>
         </div>
         <div className="divider vertical" />
         <Tooltip label={t(L.RawActualDPS)}>
            <div className="block" style={{ width: 85 }}>
               <div className="mi">explosion</div>
               <div className="f1 text-right">
                  <div>{formatNumber(reduceOf(actualDamages, (prev, curr, value) => prev + value, 0))}</div>
                  <div className="xs">{formatNumber(reduceOf(rawDamages, (prev, curr, value) => prev + value, 0))}</div>
               </div>
            </div>
         </Tooltip>
         <div className="divider vertical" />
         <Tooltip
            multiline
            maw="30vw"
            label={
               <>
                  <RenderHTML html={t(L.QuantumTooltipHTMLV2)} />
                  <RenderHTML html={t(L.QuantumFromPermanentElementTooltipHTML)} />
               </>
            }
         >
            <div
               className="block pointer"
               style={{ width: 100, position: "relative" }}
               onClick={() => {
                  showModal({
                     children: <QuantumProgressModal />,
                     title: t(L.QuantumProgress),
                     dismiss: true,
                     size: "lg",
                  });
               }}
            >
               <div className="mi" id="ship-info-quantum">
                  orbit
               </div>
               <div className="f1 text-right">
                  <div>
                     {formatNumber(usedQuantum)}/{formatNumber(quantum)}
                  </div>
                  <div className="xs">{formatHMS((1000 * (nextQuantumXP - currentXP)) / xpDelta)}</div>
               </div>
            </div>
         </Tooltip>
         <div className="divider vertical" />
         <div className="block pointer" style={{ width: 60 }}>
            <div className="f1 text-right">
               <div>{formatPercent((currentXP - prevQuantumXP) / (nextQuantumXP - prevQuantumXP))}</div>
               <div className={classNames("xs text-right", xpDelta > 0 ? "text-green" : "text-red")}>
                  {mathSign(xpDelta)}
                  {formatPercent(Math.abs(xpDelta / (nextQuantumXP - prevQuantumXP)))}
               </div>
            </div>
         </div>
         <div className="divider vertical" />
         <Tooltip color="gray" label={<ElementTooltip />}>
            <div
               style={{ width: 100 }}
               className="block pointer"
               onClick={() => {
                  showModal({
                     children: <QuantumProgressModal />,
                     title: t(L.QuantumProgress),
                     dismiss: true,
                     size: "lg",
                  });
               }}
            >
               <div className="mi">category</div>
               <div className="w5" />
               <div className="f1 text-right">
                  <div>
                     +
                     {formatNumber(
                        mReduceOf(G.save.current.elements, (prev, curr, value) => prev + value.hp + value.damage, 0),
                     )}
                     /+
                     {formatNumber(
                        mReduceOf(
                           G.save.current.permanentElements,
                           (prev, curr, value) => prev + value.hp + value.damage,
                           0,
                        ),
                     )}
                  </div>
                  <div className="text-xs">
                     <div className="xs">{formatHMS((1000 * (nextElementXP - currentXP)) / xpDelta)}</div>
                  </div>
               </div>
            </div>
         </Tooltip>
         <div className="divider vertical" />
         <Tooltip color="gray" label={<ElementTooltip />}>
            <div
               style={{ width: 60 }}
               className="block pointer"
               onClick={() => {
                  showModal({
                     children: <QuantumProgressModal />,
                     title: t(L.QuantumProgress),
                     dismiss: true,
                     size: "lg",
                  });
               }}
            >
               <div className="f1 text-right">
                  <div>{formatPercent((currentXP - prevElementXP) / (nextElementXP - prevElementXP))}</div>
                  <div className={classNames("xs text-right", xpDelta > 0 ? "text-green" : "text-red")}>
                     {mathSign(xpDelta)}
                     {formatPercent(Math.abs(xpDelta / (nextElementXP - prevElementXP)))}
                  </div>
               </div>
            </div>
         </Tooltip>
         <div className="divider vertical" />
         <WarpSpeedMenuComp gs={state} />
      </div>
   );
}

function playQuantumParticle(): void {
   playBling();
   const target = document.getElementById("ship-info-quantum")?.getBoundingClientRect();
   G.starfield.playParticle(
      G.textures.get("Misc/Quantum"),
      {
         x: document.body.clientWidth / 2,
         y: document.body.clientHeight / 2,
      },
      {
         x: target ? target.x + target.width / 2 : 0,
         y: target ? target.y + target.height / 2 : 0,
      },
      1,
   );
}

function _DiscordComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <Tooltip label={t(L.JoinDiscord)}>
         <img src={Discord} style={{ display: "block", height: 20 }} onClick={() => openUrl(DiscordUrl)} />
      </Tooltip>
   );
}

export const DiscordComp = memo(_DiscordComp, (prev, next) => prev.show === next.show);

function _SteamComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <Tooltip label={t(L.WishlistFullGame)}>
         <img src={Steam} style={{ display: "block", height: 20 }} onClick={() => openUrl(SteamUrl)} />
      </Tooltip>
   );
}

export const SteamComp = memo(_SteamComp, (prev, next) => prev.show === next.show);

export function ProgressComp({
   height,
   progress,
}: {
   height: number;
   progress: { color: string; value: number }[];
}): React.ReactNode {
   return (
      <div
         style={{ background: "var(--mantine-color-dark-4)", height, borderRadius: height / 2, position: "relative" }}
      >
         {progress.map((p, i) => (
            <div
               key={i}
               style={{
                  background: p.color,
                  height,
                  borderRadius: height / 2,
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: `${clamp(100 * p.value, 0, 100)}%`,
               }}
            />
         ))}
      </div>
   );
}

function ElementTooltip(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const currentXP = G.save.current.resources.get("XP") ?? 0;
   const element = xpToElement(currentXP);
   const nextElement = element + 1;
   const nextElementXP = elementToXP(nextElement);
   const prevElementXP = elementToXP(element);
   const xpDelta = G.runtime.leftStat.averageResourceDelta("XP", 60);
   return (
      <div style={{ width: 300 }}>
         <div className="row">
            <div className="f1">{t(L.XPRequiredForNextElement)}</div>
            <div>{formatNumber(nextElementXP)}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.CurrentTotalXp)}</div>
            <div>{formatNumber(currentXP)}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.ProgressTowardsNextElement)}</div>
            <div>{formatPercent((currentXP - prevElementXP) / (nextElementXP - prevElementXP))}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.TimeUntilNextElement)}</div>
            <div>{formatHMS((1000 * (nextElementXP - currentXP)) / xpDelta)}</div>
         </div>
         <div className="divider light dashed my10" />
         <table className="w100">
            <thead>
               <tr>
                  <th className="text-left">{t(L.ElementThisRun)}</th>
                  <th className="text-right">{t(L.HP)}</th>
                  <th className="text-right">{t(L.DMG)}</th>
               </tr>
            </thead>
            <tbody>
               {mMapOf(G.save.current.elements, (element, data) => {
                  return (
                     <tr key={element}>
                        <td className="row g5">
                           <div>{t(element)}</div>
                           <div className="text-space text-sm">({getBuildingName(Config.Elements[element])})</div>
                           <div className="f1" />
                        </td>
                        <td className="text-right">+{formatNumber(data.hp)}</td>
                        <td className="text-right">+{formatNumber(data.damage)}</td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
         <div className="divider light dashed my10" />
         <table className="w100">
            <thead>
               <tr>
                  <th className="text-left">{t(L.PermanentElement)}</th>
                  <th className="text-right">{t(L.HP)}</th>
                  <th className="text-right">{t(L.DMG)}</th>
               </tr>
            </thead>
            <tbody>
               {mMapOf(G.save.current.permanentElements, (element, data) => {
                  return (
                     <tr key={element}>
                        <td className="row g5">
                           <div>{t(element)}</div>
                           <div className="text-space text-sm">({getBuildingName(Config.Elements[element])})</div>
                           <div className="f1" />
                        </td>
                        <td className="text-right">+{formatNumber(data.hp)}</td>
                        <td className="text-right">+{formatNumber(data.damage)}</td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
   );
}
