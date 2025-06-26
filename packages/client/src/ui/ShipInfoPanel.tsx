import { Progress, Tooltip } from "@mantine/core";
import { DamageType } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { DiscordUrl, SteamUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import {
   calcSpaceshipXP,
   getCurrentQuantum,
   getMaxSpaceshipXP,
   getNextQuantumProgress,
   getQuantumLimit,
   getUsedQuantum,
   resourceDiffOf,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import {
   clamp,
   classNames,
   formatNumber,
   formatPercent,
   hasFlag,
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
import { showModal } from "../utils/ToggleModal";
import { HamburgerMenuComp } from "./components/HamburgerMenuComp";
import { ResourceAmount } from "./components/ResourceAmountComp";
import { XPIcon } from "./components/SVGIcons";
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
   const powerDelta = resourceDiffOf(
      "Power",
      hasFlag(options.flag, GameOptionFlag.TheoreticalValue),
      G.runtime.leftStat,
   );
   const xpDelta = resourceDiffOf("XP", hasFlag(options.flag, GameOptionFlag.TheoreticalValue), G.runtime.leftStat);
   const [progress, denom] = getNextQuantumProgress(state);
   const quantumDelta = progress <= 0 ? 0 : xpDelta / denom;
   const sv = calcSpaceshipXP(state);
   G.runtime.rightStat.averageRawDamage(10, rawDamages);
   G.runtime.rightStat.averageActualDamage(10, actualDamages);
   const maxSV = getMaxSpaceshipXP(state);
   const quantumLimit = getQuantumLimit(state);
   return (
      <div className="sf-frame top ship-info">
         <HamburgerMenuComp flag={options.flag} />
         <div className="divider vertical" />
         <PowerComp power={state.resources.get("Power") ?? 0} delta={powerDelta} />
         <div className="divider vertical" />
         <XPComp xp={state.resources.get("XP") ?? 0} delta={xpDelta} />
         <div className="divider vertical" />
         <SpaceshipValueComp sv={sv} maxSV={maxSV} quantum={quantumLimit} />
         <div className="divider vertical" />
         <BattleComp highlight={getUsedQuantum(G.save.current) >= getQuantumLimit(state)} quantum={quantumLimit} />
         <div className="divider vertical" />
         <QuantumProgressComp
            usedQuantum={getUsedQuantum(state)}
            currentQuantum={getCurrentQuantum(state)}
            qualifiedQuantum={quantumLimit}
         />
         <div className="divider vertical" />
         <WarpSpeedMenuComp gs={state} />
         <div className="divider vertical" />
         <ElementComp count={mReduceOf(G.save.current.elements, (prev, curr, value) => prev + value, 0)} />
         <div className="divider vertical" />
         <DPSComp
            raw={reduceOf(rawDamages, (prev, curr, value) => prev + value, 0)}
            actual={reduceOf(actualDamages, (prev, curr, value) => prev + value, 0)}
         />
         <SteamComp show={!hasFlag(options.flag, GameOptionFlag.HideSteamIcon)} />
         <DiscordComp show={!hasFlag(options.flag, GameOptionFlag.HideDiscordIcon)} />
      </div>
   );
}

const Width = 90;

function _PowerComp({ power, delta }: { power: number; delta: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.Power)}>
         <div className="block" style={{ width: Width }}>
            <div className="mi">bolt</div>
            <div className="f1 text-right">
               <ResourceAmount res="Power" amount={power} />
               <div
                  className="xs"
                  style={{
                     color: delta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                  }}
               >
                  {mathSign(delta)}
                  {formatNumber(Math.abs(delta))}
               </div>
            </div>
         </div>
      </Tooltip>
   );
}

const PowerComp = memo(_PowerComp, (prev, next) => prev.power === next.power && prev.delta === next.delta);

function _XPComp({ xp, delta }: { xp: number; delta: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.XP)}>
         <div className="block" style={{ width: Width }}>
            <div className="mi">view_in_ar</div>
            <div className="f1 text-right">
               <div>
                  <ResourceAmount res="XP" amount={xp} />
               </div>
               <div
                  className="xs"
                  style={{
                     color: delta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                  }}
               >
                  {mathSign(delta)}
                  {formatNumber(Math.abs(delta))}
               </div>
            </div>
         </div>
      </Tooltip>
   );
}

const XPComp = memo(_XPComp, (prev, next) => prev.xp === next.xp && prev.delta === next.delta);

function _SpaceshipValueComp({ sv, maxSV, quantum }: { sv: number; maxSV: number; quantum: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.SpaceshipXPTooltip, formatNumber(quantum))}>
         <div className="block" style={{ width: 150, position: "relative" }}>
            <XPIcon />
            <div className="w5" />
            <div className="f1 text-right">
               <Progress color="green" value={clamp((100 * sv) / maxSV, 0, 100)} />
               <div className="xs mt5">
                  {formatNumber(sv)}/{formatNumber(maxSV)}
               </div>
            </div>
         </div>
      </Tooltip>
   );
}

const SpaceshipValueComp = memo(
   _SpaceshipValueComp,
   (prev, next) => prev.sv === next.sv && prev.maxSV === next.maxSV && prev.quantum === next.quantum,
);

function _DPSComp({ raw, actual }: { raw: number; actual: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.RawActualDPS)}>
         <div className="block" style={{ width: 80 }}>
            <div className="mi">explosion</div>
            <div className="f1 text-right">
               <div>{formatNumber(actual)}</div>
               <div className="xs">{formatNumber(raw)}</div>
            </div>
         </div>
      </Tooltip>
   );
}

const DPSComp = memo(_DPSComp, (prev, next) => prev.raw === next.raw && prev.actual === next.actual);

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

function QuantumProgressComp({
   usedQuantum,
   currentQuantum,
   qualifiedQuantum,
}: {
   usedQuantum: number;
   currentQuantum: number;
   qualifiedQuantum: number;
}): React.ReactNode {
   return (
      <div
         className="block pointer"
         style={{ width: 150, position: "relative" }}
         onClick={() => {
            showModal({
               children: <QuantumProgressModal />,
               title: t(L.QuantumProgress),
               dismiss: true,
               size: "lg",
            });
         }}
      >
         <div className="mi">orbit</div>
         <div className="w5" />
         <div className="f1">
            <div
               style={{ background: "var(--mantine-color-dark-4)", height: 8, borderRadius: 4, position: "relative" }}
            >
               <div
                  style={{
                     background: "var(--mantine-color-space-filled)",
                     height: 8,
                     borderRadius: 4,
                     position: "absolute",
                     left: 0,
                     top: 0,
                     width: `${clamp((100 * currentQuantum) / qualifiedQuantum, 0, 100)}%`,
                  }}
               />
               <div
                  style={{
                     background: "var(--mantine-color-green-filled)",
                     height: 8,
                     borderRadius: 4,
                     position: "absolute",
                     left: 0,
                     top: 0,
                     width: `${clamp((100 * usedQuantum) / qualifiedQuantum, 0, 100)}%`,
                  }}
               />
            </div>
            <div className="xs mt5 text-right">
               {formatNumber(usedQuantum)}/{formatNumber(currentQuantum)}/{formatNumber(qualifiedQuantum)}
            </div>
         </div>
      </div>
   );
}

function _QuantumComp({
   usedQuantum,
   currentQuantum,
   progress,
   delta,
}: {
   usedQuantum: number;
   currentQuantum: number;
   progress: number;
   delta: number;
}): React.ReactNode {
   return (
      <div
         className="block pointer"
         style={{ width: 130, position: "relative" }}
         onClick={() => {
            showModal({
               children: <QuantumProgressModal />,
               title: t(L.QuantumProgress),
               dismiss: true,
               size: "lg",
            });
         }}
      >
         <div className="progress" style={{ width: progress * 130 }}></div>
         <div className="mi" id="ship-info-quantum">
            orbit
         </div>
         <div className="f1" />
         <Tooltip label={t(L.QuantumProgressTooltip)}>
            <div className="text-right">
               <div>{formatPercent(progress)}</div>
               <div className={classNames("xs", delta >= 0 ? "text-green" : "text-red")}>
                  {mathSign(delta)}
                  {formatPercent(Math.abs(delta))}
               </div>
            </div>
         </Tooltip>
         <div className="w10" />
         <Tooltip label={t(L.QuantumTooltip)}>
            <div className="text-right">
               <div
                  style={{
                     color:
                        usedQuantum < currentQuantum
                           ? "var(--mantine-color-green-text)"
                           : "var(--mantine-color-red-text)",
                  }}
               >
                  {formatNumber(usedQuantum)}
               </div>
               <div className="xs">{formatNumber(currentQuantum)}</div>
            </div>
         </Tooltip>
      </div>
   );
}

const QuantumComp = memo(_QuantumComp, (prev, next) => {
   if (next.currentQuantum > prev.currentQuantum) {
      playQuantumParticle();
   }
   return (
      prev.usedQuantum === next.usedQuantum &&
      prev.currentQuantum === next.currentQuantum &&
      prev.progress === next.progress &&
      prev.delta === next.delta
   );
});

function _ElementComp({ count }: { count: number }): React.ReactNode {
   return (
      <Tooltip
         label={
            <div>
               <div style={{ color: "var(--mantine-color-dimmed)" }}>{t(L.ElementThisRun)}</div>
               {mMapOf(G.save.current.elements, (symbol, amount) => (
                  <div className="row" key={symbol}>
                     <div>{symbol}</div>
                     <div className="f1 text-right">{amount}</div>
                  </div>
               ))}
            </div>
         }
      >
         <div
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
            <div className="f1 text-right">{count}</div>
         </div>
      </Tooltip>
   );
}

const ElementComp = memo(_ElementComp, (prev, next) => prev.count === next.count);

function _DiscordComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <>
         <div className="divider vertical" />
         <Tooltip label={t(L.JoinDiscord)}>
            <div className="pointer" style={{ width: 40 }} onClick={() => openUrl(DiscordUrl)}>
               <img src={Discord} style={{ height: 20 }} />
            </div>
         </Tooltip>
      </>
   );
}

const DiscordComp = memo(_DiscordComp, (prev, next) => prev.show === next.show);

function _SteamComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <>
         <div className="divider vertical" />
         <Tooltip label={t(L.WishlistFullGame)}>
            <div className="pointer" style={{ width: 40 }} onClick={() => openUrl(SteamUrl)}>
               <img src={Steam} style={{ height: 20 }} />
            </div>
         </Tooltip>
      </>
   );
}

const SteamComp = memo(_SteamComp, (prev, next) => prev.show === next.show);

function _BattleComp({ highlight, quantum }: { highlight: boolean; quantum: number }): React.ReactNode {
   return (
      <Tooltip disabled={!highlight} label={t(L.ReachedQuantumLimit, formatNumber(quantum))} multiline maw="30vw">
         <div
            className="pointer"
            onClick={() => {
               showModal({
                  children: <PrepareForBattleModal mode={PrepareForBattleMode.Normal} />,
                  size: "sm",
                  dismiss: true,
               });
            }}
            style={{ width: 40 }}
         >
            <div style={{ fontSize: 24 }} className={classNames("mi", highlight ? "breathing text-red" : null)}>
               swords
            </div>
         </div>
      </Tooltip>
   );
}

const BattleComp = memo(
   _BattleComp,
   (prev, next) => prev.highlight === next.highlight && prev.quantum === next.quantum,
);
