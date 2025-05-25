import { Tooltip } from "@mantine/core";
import { DamageType } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { DiscordUrl, SteamUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import {
   availableQuantum,
   calculateSpaceshipValue,
   currentQuantum,
   maxSpaceshipValue,
   nextQuantumProgress,
   quantumLimit,
   quantumQualified,
   resourceDiff,
   usedQuantum,
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
import { PrepareForBattleModal } from "./PrepareForBattleModal";
import { QuantumProgressModal } from "./QuantumProgressModal";
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
   const powerDelta = resourceDiff("Power", hasFlag(options.flag, GameOptionFlag.TheoreticalValue), G.runtime.leftStat);
   const xpDelta = resourceDiff("XP", hasFlag(options.flag, GameOptionFlag.TheoreticalValue), G.runtime.leftStat);
   const [progress, denom] = nextQuantumProgress(state);
   const quantumDelta = xpDelta / denom;
   const availableQ = availableQuantum(state);
   const sv = calculateSpaceshipValue(state);
   G.runtime.rightStat.averageRawDamage(10, rawDamages);
   G.runtime.rightStat.averageActualDamage(10, actualDamages);
   const maxSV = maxSpaceshipValue(state);
   return (
      <div className="sf-frame ship-info">
         <HamburgerMenuComp flag={options.flag} />
         <div className="divider vertical" />
         <PowerComp power={state.resources.get("Power") ?? 0} delta={powerDelta} />
         <div className="divider vertical" />
         <XPComp xp={state.resources.get("XP") ?? 0} delta={xpDelta} />
         <div className="divider vertical" />
         <SpaceshipValueComp sv={sv} maxSV={maxSV} />
         <div className="divider vertical" />
         <QuantumComp
            availableQuantum={availableQ}
            currentQuantum={currentQuantum(state)}
            quantumDelta={quantumDelta}
            quantumProgress={progress}
         />
         <div className="divider vertical" />
         <WarpSpeedMenuComp gs={state} />
         <div className="divider vertical" />
         <ElementComp
            key={mReduceOf(G.save.current.elements, (prev, _, value) => prev + value, 0)}
            animate={G.save.current.elementChoices.length > 0}
         />
         <div className="divider vertical" />
         <DPSComp
            raw={reduceOf(rawDamages, (prev, curr, value) => prev + value, 0)}
            actual={reduceOf(actualDamages, (prev, curr, value) => prev + value, 0)}
         />
         <div className="divider vertical" />
         <BattleComp highlight={usedQuantum(G.save.current) >= quantumLimit(state)} quantum={quantumQualified(state)} />
         <SteamComp show={!hasFlag(options.flag, GameOptionFlag.HideSteamIcon)} />
         <DiscordComp show={!hasFlag(options.flag, GameOptionFlag.HideDiscordIcon)} />
      </div>
   );
}

function _PowerComp({ power, delta }: { power: number; delta: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.Power)}>
         <div className="col" style={{ width: 80 }} title={t(L.Power)}>
            <div className="mi">bolt</div>
            <div>
               <ResourceAmount res="Power" amount={power} />
               <span
                  style={{
                     color: delta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                  }}
               >
                  {mathSign(delta)}
                  {formatNumber(Math.abs(delta))}
               </span>
            </div>
         </div>
      </Tooltip>
   );
}

const PowerComp = memo(_PowerComp, (prev, next) => prev.power === next.power && prev.delta === next.delta);

function _XPComp({ xp, delta }: { xp: number; delta: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.XP)}>
         <div className="col" style={{ width: 90 }}>
            <div className="mi">view_in_ar</div>
            <div>
               <ResourceAmount res="XP" amount={xp} />
               <span
                  style={{
                     color: delta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                  }}
               >
                  {mathSign(delta)}
                  {formatNumber(Math.abs(delta))}
               </span>
            </div>
         </div>
      </Tooltip>
   );
}

const XPComp = memo(_XPComp, (prev, next) => prev.xp === next.xp && prev.delta === next.delta);

function _SpaceshipValueComp({ sv, maxSV }: { sv: number; maxSV: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.SpaceshipXPTooltip)}>
         <div className="col" style={{ width: 90, position: "relative" }}>
            <div className="progress" style={{ width: clamp(sv / maxSV, 0, 1) * 90 }}></div>
            <div className="mi">paid</div>
            <div>
               {formatNumber(sv)}/{formatNumber(maxSV)}
            </div>
         </div>
      </Tooltip>
   );
}

const SpaceshipValueComp = memo(_SpaceshipValueComp, (prev, next) => prev.sv === next.sv && prev.maxSV === next.maxSV);

function _DPSComp({ raw, actual }: { raw: number; actual: number }): React.ReactNode {
   return (
      <Tooltip label={t(L.RawActualDPS)}>
         <div className="col" style={{ width: 90 }}>
            <div className="mi">explosion</div>
            <div>
               {formatNumber(raw)}/{formatNumber(actual)}
            </div>
         </div>
      </Tooltip>
   );
}

const DPSComp = memo(_DPSComp, (prev, next) => prev.raw === next.raw && prev.actual === next.actual);

function _QuantumComp({
   availableQuantum,
   currentQuantum,
   quantumDelta,
   quantumProgress,
}: {
   availableQuantum: number;
   currentQuantum: number;
   quantumDelta: number;
   quantumProgress: number;
}): React.ReactNode {
   return (
      <Tooltip label={t(L.QuantumTooltip, formatPercent(quantumProgress))}>
         <div
            className="col pointer"
            style={{ width: 90, position: "relative" }}
            onClick={() => {
               showModal({
                  children: <QuantumProgressModal />,
                  title: t(L.QuantumProgress),
                  dismiss: true,
                  size: "lg",
               });
            }}
         >
            <div className="progress" style={{ width: quantumProgress * 90 }}></div>
            <div className="mi">orbit</div>
            <div>
               <span
                  style={{
                     color: availableQuantum >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                  }}
               >
                  {formatNumber(availableQuantum)}
               </span>
               /{formatNumber(currentQuantum)}
               <span
                  style={{
                     color: quantumDelta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                  }}
               >
                  {mathSign(quantumDelta)}
                  {formatPercent(Math.abs(quantumDelta), 0)}
               </span>
            </div>
         </div>
      </Tooltip>
   );
}

const QuantumComp = memo(
   _QuantumComp,
   (prev, next) =>
      prev.availableQuantum === next.availableQuantum &&
      prev.currentQuantum === next.currentQuantum &&
      prev.quantumDelta === next.quantumDelta &&
      prev.quantumProgress === next.quantumProgress,
);

function _ElementComp({ animate }: { animate: boolean }): React.ReactNode {
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
         <div style={{ width: 40 }} className={classNames(animate ? "text-green breathing" : null)}>
            <div className="mi">category</div>
            <div>{mReduceOf(G.save.current.elements, (prev, curr, value) => prev + value, 0)}</div>
         </div>
      </Tooltip>
   );
}

const ElementComp = memo(_ElementComp, (prev, next) => prev.animate === next.animate);

function _DiscordComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <>
         <div className="divider vertical" />
         <Tooltip label={t(L.JoinDiscord)}>
            <div className="pointer" style={{ width: 40 }} onClick={() => openUrl(DiscordUrl)}>
               <img src={Discord} style={{ width: 30 }} />
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
               <img src={Steam} style={{ width: 24 }} />
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
                  children: <PrepareForBattleModal />,
                  title: t(L.QuantumQualifier, quantum),
                  size: "sm",
                  dismiss: true,
               });
            }}
            style={{ width: 40 }}
         >
            <div style={{ fontSize: 28 }} className={classNames("mi", highlight ? "breathing text-red" : null)}>
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
