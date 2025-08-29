import { clamp, useForceUpdate } from "@mantine/hooks";
import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import {
   BoosterElementId,
   VictoryPointElementId,
   XPElementId,
} from "@spaceship-idle/shared/src/game/definitions/Constant";
import type { BattleResult } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import type { BattleInfo } from "@spaceship-idle/shared/src/game/logic/BattleInfo";
import { getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType, BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { findPlanet, getBoosterReward } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { calculateRewardValue } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { formatNumber, getDOMRectCenter, mMapOf, randomAlphaNumeric } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { Sprite } from "pixi.js";
import { useRef } from "react";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { DefeatedHeaderComp, VictoryHeaderComp } from "./components/BattleResultHeader";
import { FloatingTip } from "./components/FloatingTip";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { NumberSelect } from "./components/NumberInput";
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
      boosters: new Map(),
      resources: new Map([
         ["VictoryPoint", victoryType === "Defeated" ? 0 : 1],
         ["XP", 0],
      ]),
   });
   const [value, breakdown] = calculateRewardValue(battleResult.current, G.save.state);
   const leftOver = clamp(battleScore - value, 0, Number.POSITIVE_INFINITY);
   battleResult.current.resources.set("XP", (leftOver / 100) * enemyXP);
   let texture = "Others/SpaceshipEnemy24";

   if (battleInfo.planetId) {
      const planet = findPlanet(battleInfo.planetId, G.save.data.galaxy);
      if (planet) {
         texture = `Galaxy/${planet.texture}`;
         const boosters = getBoosterReward(planet.seed, G.save.state);
         boosters.forEach((booster) => {
            battleResult.current.boosters.set(booster, 0);
         });
      }
   }

   if (battleResult.current.boosters.size === 0) {
      const boosters = getBoosterReward(randomAlphaNumeric(16), G.save.state);
      boosters.forEach((booster) => {
         battleResult.current.boosters.set(booster, 0);
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
            <div>SS {G.save.state.name}</div>
            <div className="f1" />
            <div>{name}</div>
            <TextureComp name={texture} width={48} />
         </div>
         <div className="h10" />
         <div className="row">
            <div className="f1 panel stretch">
               <div>
                  {BattleVictoryTypeLabel[victoryType]()} ({battleScore}%)
               </div>
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
               {mMapOf(battleResult.current.boosters, (booster, count) => (
                  <div key={booster} className="row">
                     <div className="f1">
                        <TextureComp name={`Booster/${booster}`} className="inline-middle" /> {Boosters[booster].name()}
                     </div>
                     <NumberSelect
                        value={count}
                        canIncrease={(value) => victoryType !== "Defeated" && value < 9}
                        canDecrease={(value) => victoryType !== "Defeated" && value > 0}
                        onChange={(value) => {
                           battleResult.current.boosters.set(booster, value);
                           forceUpdate();
                        }}
                     />
                  </div>
               ))}
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Others/XP" className="inline-middle" /> {t(L.XP)}
                  </div>
                  <div>{formatNumber(battleResult.current.resources.get("XP") ?? 0)}</div>
               </div>
            </div>
         </div>
         <div className="row my10" style={{ fontSize: 30 }}>
            <div className="f1 text-center">{battleScore}</div>
            {battleScore >= value ? (
               <div className="mi text-green" style={{ fontSize: 30 }}>
                  sentiment_satisfied
               </div>
            ) : (
               <div className="mi text-red" style={{ fontSize: 30 }}>
                  sentiment_dissatisfied
               </div>
            )}
            <div className="f1 text-center">{value}</div>
         </div>
         <button
            className="btn w100 filled p5"
            disabled={battleScore < value}
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
                  const boosterTarget = document.getElementById(BoosterElementId)?.getBoundingClientRect();
                  if (boosterTarget) {
                     battleResult.current.boosters.forEach((count, booster) => {
                        G.starfield.playParticle(
                           () => {
                              const sprite = new Sprite(G.textures.get(`Booster/${booster}`));
                              sprite.scale.set(2);
                              return sprite;
                           },
                           getDOMRectCenter(from),
                           getDOMRectCenter(boosterTarget),
                           count,
                        );
                     });
                  }

                  const xpTarget = document.getElementById(XPElementId)?.getBoundingClientRect();
                  const xp = battleResult.current.resources.get("XP");
                  if (xpTarget && xp && xp > 0) {
                     G.starfield.playParticle(
                        () => {
                           const sprite = new Sprite(G.textures.get("Others/XP"));
                           sprite.scale.set(2);
                           return sprite;
                        },
                        getDOMRectCenter(from),
                        getDOMRectCenter(xpTarget),
                        5,
                     );
                  }

                  const victoryPointTarget = document.getElementById(VictoryPointElementId)?.getBoundingClientRect();
                  const victoryPoint = battleResult.current.resources.get("VictoryPoint");
                  if (victoryPointTarget && victoryPoint && victoryPoint > 0) {
                     G.starfield.playParticle(
                        () => {
                           const sprite = new Sprite(G.textures.get("Others/Trophy"));
                           sprite.scale.set(2);
                           return sprite;
                        },
                        getDOMRectCenter(from),
                        getDOMRectCenter(victoryPointTarget),
                        victoryPoint,
                     );
                  }
               }, 1000);
            }}
         >
            <FloatingTip
               disabled={victoryType === "Defeated"}
               w={400}
               label={
                  <>
                     <div>
                        You have <b>{battleScore}</b> battle score and the war reparation cannot exceed this. Your first
                        Victory Point and Booster are free. Your remaining <b>{leftOver}</b> battle score is converted
                        to <b>{formatNumber(battleResult.current.resources.get("XP") ?? 0)}</b> XP
                     </div>
                     <div className="h5" />
                     <div className="flex-table mx-10">
                        {breakdown.map((b) => (
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
