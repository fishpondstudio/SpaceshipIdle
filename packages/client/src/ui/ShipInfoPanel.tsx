import { Tooltip } from "@mantine/core";
import { DamageType } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
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
   Rounding,
} from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { showModal } from "../utils/ToggleModal";
import { ChooseElementModal } from "./ChooseElementModal";
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
      <div
         className="sf-frame"
         style={{
            padding: 1,
            position: "absolute",
            top: 10,
            left: 10,
            textAlign: "center",
            fontSize: "var(--mantine-font-size-xs)",
         }}
      >
         <div className="row g0">
            <HamburgerMenuComp flag={options.flag} />
            <div className="divider vertical" />
            <Tooltip label={t(L.Power)}>
               <div className="col" style={{ width: 80 }} title={t(L.Power)}>
                  <div className="mi">bolt</div>
                  <div>
                     <ResourceAmount res="Power" amount={state.resources.get("Power") ?? 0} />
                     <span
                        style={{
                           color: powerDelta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                        }}
                     >
                        {mathSign(powerDelta)}
                        {formatNumber(Math.abs(powerDelta))}
                     </span>
                  </div>
               </div>
            </Tooltip>
            <div className="divider vertical" />
            <Tooltip label={t(L.XP)}>
               <div className="col" style={{ width: 90 }}>
                  <div className="mi">view_in_ar</div>
                  <div>
                     <ResourceAmount res="XP" amount={state.resources.get("XP") ?? 0} />
                     <span
                        style={{
                           color: xpDelta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                        }}
                     >
                        {mathSign(xpDelta)}
                        {formatNumber(Math.abs(xpDelta))}
                     </span>
                  </div>
               </div>
            </Tooltip>
            <div className="divider vertical" />
            <Tooltip label={t(L.SpaceshipValueTooltip)}>
               <div className="col" style={{ width: 90, position: "relative" }}>
                  <div
                     style={{
                        position: "absolute",
                        left: 0,
                        bottom: -1,
                        transition: "width 0.2s ease-in-out",
                        backgroundColor: "var(--mantine-color-blue-filled)",
                        height: 3,
                        width: clamp(sv / maxSV, 0, 1) * 90,
                     }}
                  ></div>
                  <div className="mi">paid</div>
                  <div>
                     {formatNumber(sv)}/{formatNumber(maxSV)}
                  </div>
               </div>
            </Tooltip>
            <div className="divider vertical" />
            <Tooltip label={t(L.RawActualDPS)}>
               <div className="col" style={{ width: 90 }}>
                  <div className="mi">explosion</div>
                  <div>
                     {formatNumber(reduceOf(rawDamages, (prev, curr, value) => prev + value, 0))}/
                     {formatNumber(reduceOf(actualDamages, (prev, curr, value) => prev + value, 0))}
                  </div>
               </div>
            </Tooltip>
            <div className="divider vertical" />
            <div
               className="col"
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
               <div
                  style={{
                     position: "absolute",
                     left: 0,
                     bottom: -1,
                     transition: "width 0.2s ease-in-out",
                     backgroundColor: "var(--mantine-color-blue-filled)",
                     height: 3,
                     width: progress * 90,
                  }}
               ></div>
               <Tooltip label={t(L.ProgressTowardsNextQuantum, formatPercent(progress, 0, Rounding.Floor))}>
                  <div className="mi">orbit</div>
               </Tooltip>
               <Tooltip label={t(L.QuantumTooltip)}>
                  <div>
                     <span
                        style={{
                           color: availableQ >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                        }}
                     >
                        {formatNumber(availableQ)}
                     </span>
                     /{formatNumber(currentQuantum(state))}
                     <span
                        style={{
                           color:
                              quantumDelta >= 0 ? "var(--mantine-color-green-text)" : "var(--mantine-color-red-text)",
                        }}
                     >
                        {mathSign(quantumDelta)}
                        {formatPercent(Math.abs(quantumDelta), 0)}
                     </span>
                  </div>
               </Tooltip>
            </div>
            <div className="divider vertical" />
            <WarpSpeedMenuComp gs={state} />
            <div className="divider vertical" />
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
                  style={{ width: 40 }}
                  className={classNames(G.save.current.elementChoices.length > 0 ? "text-green breathing" : null)}
                  onClick={() => {
                     if (G.save.current.elementChoices.length === 0) return;
                     showModal({
                        children: <ChooseElementModal permanent={false} choice={G.save.current.elementChoices[0]} />,
                        title: t(L.ElementThisRun),
                        size: "xl",
                     });
                  }}
               >
                  <div className="mi">category</div>
                  <div>{mReduceOf(G.save.current.elements, (prev, curr, value) => prev + value, 0)}</div>
               </div>
            </Tooltip>
            <div className="divider vertical" />
            <Tooltip
               disabled={usedQuantum(G.save.current) < quantumLimit(state)}
               label={t(L.ReachedQuantumLimit, formatNumber(quantumLimit(state)))}
               onClick={() => {
                  showModal({
                     children: <PrepareForBattleModal />,
                     title: t(L.QuantumQualifier, quantumQualified(state)),
                     size: "sm",
                     dismiss: true,
                  });
               }}
               multiline
               maw="30vw"
            >
               <div style={{ width: 40 }}>
                  <div
                     className={classNames(
                        "mi",
                        usedQuantum(G.save.current) >= quantumLimit(state) ? "breathing text-red" : null,
                     )}
                  >
                     swords
                  </div>
               </div>
            </Tooltip>
         </div>
      </div>
   );
}
