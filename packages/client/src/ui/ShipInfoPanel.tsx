import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageType } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import {
   DiscordUrl,
   SteamUrl,
   VictoryPointElementId,
   XPElementId,
} from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import {
   elementToXP,
   getMinimumQuantumForBattle,
   getMinimumSpaceshipXPForBattle,
   getUsedQuantum,
   quantumToXP,
   xpToElement,
   xpToQuantum,
} from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { calcSpaceshipXP, getStat, resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getShipBlueprint } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import {
   clamp,
   cls,
   divide,
   formatDelta,
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
import { FloatingTip } from "./components/FloatingTip";
import { HamburgerMenuComp } from "./components/HamburgerMenuComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { MatchmakingModal } from "./MatchmakingModal";
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
   const state = G.save.state;
   const options = G.save.options;
   G.runtime.rightStat.averageRawDamage(10, rawDamages);
   G.runtime.rightStat.averageActualDamage(10, actualDamages);
   const xpDelta = G.runtime.leftStat.averageResourceDelta("XP", 60);
   const { used: usedQuantum, total: quantum } = resourceOf("Quantum", state.resources);
   const highlight =
      usedQuantum >= getMinimumQuantumForBattle(state) &&
      calcSpaceshipXP(state) >= getMinimumSpaceshipXPForBattle(state);
   const { current: currentXP, total: totalXP } = resourceOf("XP", state.resources);
   const nextQuantum = quantum + 1;
   const nextQuantumXP = quantumToXP(nextQuantum);
   const prevQuantumXP = quantumToXP(quantum);

   const element = xpToElement(totalXP);
   const nextElement = element + 1;
   const nextElementXP = elementToXP(nextElement);
   const prevElementXP = elementToXP(element);

   const actualDPS = reduceOf(actualDamages, (prev, curr, value) => prev + value, 0);
   const rawDPS = reduceOf(rawDamages, (prev, curr, value) => prev + value, 0);
   const timeUntilNextQuantum = (1000 * (nextQuantumXP - totalXP)) / xpDelta;
   const progressTowardsNextQuantum = (totalXP - prevQuantumXP) / (nextQuantumXP - prevQuantumXP);
   const vp = resourceOf("VictoryPoint", G.save.state.resources);
   const victory = getStat("Victory", G.save.state.stats);
   const defeat = getStat("Defeat", G.save.state.stats);
   return (
      <div className="sf-frame top ship-info">
         <HamburgerMenuComp flag={options.flag} />
         <div className="divider vertical" />
         <FloatingTip
            w={300}
            label={
               <div className="flex-table mx-10">
                  <div className="row">
                     <div className="f1">{t(L.VictoryPoint)}</div>
                     <div>
                        <TextureComp name="Others/Trophy16" className="inline-middle" /> {formatNumber(vp.current)}
                     </div>
                  </div>
                  <div className="row">
                     <div className="f1">{t(L.TotalVictory)}</div>
                     <div>{formatNumber(victory)}</div>
                  </div>
                  <div className="row">
                     <div className="f1">{t(L.TotalDefeat)}</div>
                     <div>{formatNumber(defeat)}</div>
                  </div>
                  <div className="row">
                     <div className="f1">{t(L.MatchmakingQualified)}</div>
                     <div>
                        {highlight ? (
                           <div className="mi sm text-green">check_circle</div>
                        ) : (
                           <div className="mi sm text-red">cancel</div>
                        )}
                     </div>
                  </div>
               </div>
            }
         >
            <div
               id={VictoryPointElementId}
               className="block pointer"
               style={{
                  background: highlight
                     ? "linear-gradient(180deg, var(--mantine-color-space-7), var(--mantine-color-space-9))"
                     : "none",
               }}
               onClick={() => {
                  showModal({
                     children: <MatchmakingModal />,
                     size: "sm",
                     dismiss: true,
                  });
               }}
            >
               <TextureComp name="Others/Trophy" />
               <div className="w10" />
               <div className="f1 text-right">
                  <div>{formatNumber(vp.current)}</div>
                  <div className="xs">{formatPercent(divide(victory, victory + defeat))}</div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip
            label={
               <RenderHTML
                  html={t(
                     L.HPTooltipHTML,
                     formatNumber(G.runtime.leftStat.maxHp),
                     formatNumber(G.save.state.tiles.size),
                     formatNumber(getShipBlueprint(G.save.state).length),
                  )}
               />
            }
         >
            <div className="block" style={{ width: 90 }}>
               <TextureComp name="Others/HP24" />
               <div className="f1 text-right">
                  <div>{formatNumber(G.runtime.leftStat.maxHp)}</div>
                  <div className="xs">
                     {formatNumber(G.save.state.tiles.size)}/{formatNumber(getShipBlueprint(G.save.state).length)}
                  </div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip
            label={<RenderHTML html={t(L.RawActualDPSHTML, formatNumber(actualDPS), formatNumber(rawDPS))} />}
         >
            <div className="block" style={{ width: 90 }}>
               <TextureComp name="Others/Damage24" />
               <div className="f1 text-right">
                  <div>{formatNumber(actualDPS)}</div>
                  <div className="xs">{formatNumber(rawDPS)}</div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip label={<RenderHTML html={t(L.XPTooltipHTMLV2, formatNumber(currentXP))} />}>
            <div id={XPElementId} className="block" style={{ width: 90 }}>
               <TextureComp name="Others/XP24" />
               <div className="f1 text-right">
                  <div>{formatNumber(currentXP)}</div>
                  <div
                     className="xs"
                     style={{
                        color: xpDelta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                     }}
                  >
                     {formatDelta(xpDelta)}
                  </div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip w={300} label={<QuantumTooltip />}>
            <div className="block" style={{ width: 100, position: "relative" }}>
               <TextureComp name="Others/Quantum24" />
               <div className="f1 text-right">
                  <div>
                     {formatNumber(usedQuantum)}/{formatNumber(quantum)}
                  </div>
                  <div className="xs">{formatHMS(timeUntilNextQuantum)}</div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip w={300} label={<QuantumTooltip />}>
            <div className="block" style={{ width: 60 }}>
               <div className="f1 text-right">
                  <div>{formatPercent(progressTowardsNextQuantum)}</div>
                  <div className={cls("xs text-right", xpDelta > 0 ? "text-green" : "text-red")}>
                     {mathSign(xpDelta)}
                     {formatPercent(Math.abs(xpDelta / (nextQuantumXP - prevQuantumXP)))}
                  </div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip w={300} label={<ElementTooltip />}>
            <div style={{ width: 100 }} className="block">
               <TextureComp name="Others/Element24" />
               <div className="w5" />
               <div className="f1 text-right">
                  <div>
                     +
                     {formatNumber(
                        mReduceOf(G.save.state.elements, (prev, curr, value) => prev + value.hp + value.damage, 0),
                     )}
                     /+
                     {formatNumber(
                        mReduceOf(
                           G.save.state.permanentElements,
                           (prev, curr, value) => prev + value.hp + value.damage,
                           0,
                        ),
                     )}
                  </div>
                  <div className="text-xs">
                     <div className="xs">{formatHMS((1000 * (nextElementXP - totalXP)) / xpDelta)}</div>
                  </div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <FloatingTip w={300} label={<ElementTooltip />}>
            <div style={{ width: 60 }} className="block">
               <div className="f1 text-right">
                  <div>{formatPercent((totalXP - prevElementXP) / (nextElementXP - prevElementXP))}</div>
                  <div className={cls("xs text-right", xpDelta > 0 ? "text-green" : "text-red")}>
                     {mathSign(xpDelta)}
                     {formatPercent(Math.abs(xpDelta / (nextElementXP - prevElementXP)))}
                  </div>
               </div>
            </div>
         </FloatingTip>
         <div className="divider vertical" />
         <WarpSpeedMenuComp gs={state} />
      </div>
   );
}

function _DiscordComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <FloatingTip label={t(L.JoinDiscord)}>
         <img src={Discord} style={{ display: "block", height: 20 }} onClick={() => openUrl(DiscordUrl)} />
      </FloatingTip>
   );
}

export const DiscordComp = memo(_DiscordComp, (prev, next) => prev.show === next.show);

function _SteamComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <FloatingTip label={t(L.WishlistFullGame)}>
         <img src={Steam} style={{ display: "block", height: 20 }} onClick={() => openUrl(SteamUrl)} />
      </FloatingTip>
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
   const totalXP = resourceOf("XP", G.save.state.resources).total;
   const element = xpToElement(totalXP);
   const nextElement = element + 1;
   const nextElementXP = elementToXP(nextElement);
   const prevElementXP = elementToXP(element);
   const xpDelta = G.runtime.leftStat.averageResourceDelta("XP", 60);
   return (
      <>
         <div className="flex-table mx-10">
            <div className="row">
               <div className="f1">{t(L.CurrentTotalXp)}</div>
               <div>{formatNumber(totalXP)}</div>
            </div>
            <div className="row">
               <div className="f1">{t(L.XPRequiredForNextElement)}</div>
               <div>{formatNumber(nextElementXP)}</div>
            </div>
            <div className="row">
               <div className="f1">{t(L.ProgressTowardsNextElement)}</div>
               <div>{formatPercent((totalXP - prevElementXP) / (nextElementXP - prevElementXP))}</div>
            </div>
            <div className="row">
               <div className="f1">{t(L.TimeUntilNextElement)}</div>
               <div>{formatHMS((1000 * (nextElementXP - totalXP)) / xpDelta)}</div>
            </div>
         </div>
         <div className="divider my5 mx-10" />
         <table className="w100">
            <thead>
               <tr>
                  <th className="text-left">{t(L.ElementThisRun)}</th>
                  <th className="text-right">{t(L.HP)}</th>
                  <th className="text-right">{t(L.DMG)}</th>
               </tr>
            </thead>
            <tbody>
               {mMapOf(G.save.state.elements, (element, data) => {
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
         <div className="divider my5 mx-10" />
         <table className="w100">
            <thead>
               <tr>
                  <th className="text-left">{t(L.PermanentElement)}</th>
                  <th className="text-right">{t(L.HP)}</th>
                  <th className="text-right">{t(L.DMG)}</th>
               </tr>
            </thead>
            <tbody>
               {mMapOf(G.save.state.permanentElements, (element, data) => {
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
      </>
   );
}

function QuantumTooltip(): React.ReactNode {
   const usedQuantum = getUsedQuantum(G.save.state);
   const totalXP = resourceOf("XP", G.save.state.resources).total;
   const quantum = xpToQuantum(totalXP);
   const xpDelta = G.runtime.leftStat.averageResourceDelta("XP", 60);
   const nextQuantum = quantum + 1;
   const nextQuantumXP = quantumToXP(nextQuantum);
   const prevQuantumXP = quantumToXP(quantum);
   const progressTowardsNextQuantum = (totalXP - prevQuantumXP) / (nextQuantumXP - prevQuantumXP);
   const timeUntilNextQuantum = (1000 * (nextQuantumXP - totalXP)) / xpDelta;
   return (
      <>
         <div className="row">
            <div className="f1">Used/Total Quantum</div>
            <div>
               {formatNumber(usedQuantum)}/{formatNumber(quantum)}
            </div>
         </div>
         <div className="divider mx-10 mt5"></div>
         <div className="flex-table mx-10">
            <div className="row">
               <div className="f1">{t(L.CurrentTotalXp)}</div>
               <div>{formatNumber(totalXP)}</div>
            </div>
            <div className="row alt">
               <div className="f1">XP Required for Next Quantum</div>
               <div>{formatNumber(nextQuantumXP)}</div>
            </div>
            <div className="row">
               <div className="f1">Progress Towards Next Quantum</div>
               <div>{formatPercent(progressTowardsNextQuantum)}</div>
            </div>
            <div className="row alt">
               <div className="f1">Time Until Next Quantum</div>
               <div>{formatHMS(timeUntilNextQuantum)}</div>
            </div>
         </div>
      </>
   );
}
