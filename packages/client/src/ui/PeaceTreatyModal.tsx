import { clamp, useForceUpdate } from "@mantine/hooks";
import { Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import type { BattleResult } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { addAddon } from "@spaceship-idle/shared/src/game/logic/AddonLogic";
import type { BattleInfo } from "@spaceship-idle/shared/src/game/logic/BattleInfo";
import { getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType, BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { findPlanet, getAddonReward } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { calculateRewardValue, getPeaceTreatyScore } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { addResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import {
   cls,
   formatNumber,
   getDOMRectCenter,
   mMapOf,
   rollDice,
   shuffle,
} from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { DefeatedHeaderComp, VictoryHeaderComp } from "./components/BattleResultHeader";
import { FloatingTip } from "./components/FloatingTip";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { NumberSelect } from "./components/NumberInput";
import { html } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { playBling } from "./Sound";

export function PeaceTreatyModal({
   battleScore,
   name,
   enemyXP,
   battleInfo,
}: {
   battleScore: number;
   name: string;
   enemyXP: number;
   battleInfo: BattleInfo;
}): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const victoryType = getVictoryType(battleScore);
   const battleResult = useRef<BattleResult>({
      battleScore: battleScore,
      addons: new Map(),
      resources: new Map([
         ["VictoryPoint", victoryType === "Defeated" ? 0 : 1],
         ["XP", 0],
      ]),
   });
   const [peaceTreatyScore, peaceTreatyBreakdown] = useMemo(
      () => getPeaceTreatyScore(battleScore, G.save.state, G.runtime.random),
      [battleScore],
   );
   const [rewardValue, rewardBreakdown] = calculateRewardValue(battleResult.current, G.save.state);
   const leftOver = clamp(peaceTreatyScore - rewardValue, 0, Number.POSITIVE_INFINITY);
   battleResult.current.resources.set("XP", (leftOver / 100) * enemyXP);
   let texture = "Others/SpaceshipEnemy24";

   if (battleInfo.planetId) {
      const planet = findPlanet(battleInfo.planetId, G.save.data.galaxy);
      if (planet) {
         texture = `Galaxy/${planet.texture}`;
         const addons = getAddonReward(planet.seed, G.save.state);
         addons.forEach((addon) => {
            if (!battleResult.current.addons.has(addon)) {
               battleResult.current.addons.set(addon, 0);
            }
         });
      }
   }

   if (battleResult.current.addons.size === 0) {
      shuffle(Array.from(G.save.state.addons).filter(([_, data]) => data.amount > 0))
         .slice(0, 3)
         .forEach(([addon]) => {
            battleResult.current.addons.set(addon, 0);
         });
   }

   return (
      <div className="m10">
         {victoryType === "Defeated" ? (
            <DefeatedHeaderComp />
         ) : (
            <VictoryHeaderComp title={BattleVictoryTypeLabel[victoryType]()} />
         )}
         <div className="row text-lg">
            <TextureComp name="Others/Spaceship24" width={48} />
            <div>{t(L.SpaceshipPrefix, G.save.state.name)}</div>
            <div className="f1" />
            <div>{t(L.SpaceshipPrefix, name)}</div>
            <TextureComp name={texture} width={48} />
         </div>
         <div className="h10" />
         <div className="row">
            <div className="f1 panel stretch">
               {peaceTreatyBreakdown.map((b) => (
                  <FloatingTip disabled={!b.tooltip} label={b.tooltip ? html(b.tooltip) : null} key={b.label}>
                     <div className={cls("row g5", b.className)}>
                        <div className="f1">{b.label}</div>
                        {typeof b.value === "number" ? (
                           <div>{b.value}</div>
                        ) : (
                           b.value.map((v, i) => <Dice key={i} value={v} />)
                        )}
                     </div>
                  </FloatingTip>
               ))}
            </div>
            <div className="f1 panel stretch">
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
                  </div>
                  <NumberSelect
                     value={battleResult.current.resources.get("VictoryPoint") ?? 0}
                     canIncrease={(value) => victoryType !== "Defeated" && value < 9}
                     canDecrease={(value) => victoryType !== "Defeated" && value > 0}
                     onChange={(value) => {
                        battleResult.current.resources.set("VictoryPoint", value);
                        forceUpdate();
                     }}
                  />
               </div>
               {mMapOf(battleResult.current.addons, (addon, count) => {
                  return (
                     <div key={addon} className="row">
                        <div className="f1">
                           <TextureComp name={`Addon/${addon}`} className="inline-middle" /> {Addons[addon].name()}
                        </div>
                        <NumberSelect
                           value={count}
                           canIncrease={(value) => victoryType !== "Defeated" && value < 9}
                           canDecrease={(value) => victoryType !== "Defeated" && value > 0}
                           onChange={(value) => {
                              battleResult.current.addons.set(addon, value);
                              forceUpdate();
                           }}
                        />
                     </div>
                  );
               })}
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Others/XP" className="inline-middle" /> {t(L.XP)}
                  </div>
                  <div>{formatNumber(battleResult.current.resources.get("XP") ?? 0)}</div>
               </div>
            </div>
         </div>
         <div className="row my10" style={{ fontSize: 30 }}>
            <div className="f1 text-center">{peaceTreatyScore}</div>
            {peaceTreatyScore >= rewardValue ? (
               <div className="mi text-green" style={{ fontSize: 30 }}>
                  sentiment_satisfied
               </div>
            ) : (
               <div className="mi text-red" style={{ fontSize: 30 }}>
                  sentiment_dissatisfied
               </div>
            )}
            <div className="f1 text-center">{rewardValue}</div>
         </div>
         <button
            className="btn w100 filled p5"
            disabled={peaceTreatyScore < rewardValue}
            onClick={(e) => {
               showLoading();
               hideModal();

               G.speed = 1;
               G.runtime = new Runtime(G.save, new GameState());
               G.runtime.battleType = BattleType.Peace;
               G.runtime.createXPTarget();

               if (battleInfo.planetId) {
                  const planet = findPlanet(battleInfo.planetId, G.save.data.galaxy);

                  if (planet) {
                     planet.battleResult = battleResult.current;
                     planet.revealed = true;
                  }

                  G.scene.loadScene(GalaxyScene).select(battleInfo.planetId).lookAt(battleInfo.planetId);
               }

               const from = (e.target as HTMLButtonElement).getBoundingClientRect();

               setTimeout(() => {
                  hideLoading();
                  GameStateUpdated.emit();

                  if (victoryType !== "Defeated") {
                     playBling();
                  }

                  battleResult.current.resources.forEach((value, resource) => {
                     if (value > 0) {
                        addResource(resource, value, G.save.state.resources, getDOMRectCenter(from));
                     }
                  });

                  battleResult.current.addons.forEach((count, addon) => {
                     if (count > 0) {
                        addAddon(addon, count, G.save.state, getDOMRectCenter(from));
                     }
                  });
               }, 1000);
            }}
         >
            <FloatingTip
               disabled={victoryType === "Defeated"}
               w={350}
               label={
                  <>
                     <div>
                        You have <b>{peaceTreatyScore}</b> peace treaty score and the war reparation cannot exceed this.
                        Your first Victory Point and Add-on are free. Your remaining <b>{leftOver}</b> peace treaty
                        score is converted to <b>{formatNumber(battleResult.current.resources.get("XP") ?? 0)}</b> XP
                     </div>
                     <div className="h5" />
                     <div className="flex-table mx-10">
                        {rewardBreakdown.map((b) => (
                           <div className="row" key={b.label}>
                              <div className="f1">{b.label}</div>
                              <div>{b.value}</div>
                           </div>
                        ))}
                     </div>
                  </>
               }
            >
               <div className="row g5">
                  <div className="mi">signature</div>
                  <div>Sign Peace Treaty</div>
               </div>
            </FloatingTip>
         </button>
      </div>
   );
}

function _Dice({ value }: { value: number }): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const [dice, setDice] = useState(rollDice(6));
   useEffect(() => {
      for (let i = 0; i < 10; i++) {
         setTimeout(
            () => {
               if (i === 9) {
                  setDice(value);
               } else {
                  setDice(rollDice(6));
               }
               forceUpdate();
            },
            (i + 1) * 100,
         );
      }
   }, [forceUpdate, value]);
   return <TextureComp name={`Others/Dice${dice}`} />;
}

const Dice = memo(_Dice, (prev, next) => prev.value === next.value);
