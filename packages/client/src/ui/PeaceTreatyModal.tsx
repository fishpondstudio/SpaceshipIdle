import { Tooltip } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import type { BattleResult } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { getVictoryType } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleVictoryTypeLabel } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { calculateRewardValue } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { mMapOf, round } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useRef } from "react";
import { G } from "../utils/Global";
import { VictoryHeaderComp } from "./components/BattleResultHeader";
import { NumberSelect } from "./components/NumberInput";
import { TextureComp } from "./components/TextureComp";

export function PeaceTreatyModal({
   victory,
   name,
   texture,
   planetId,
}: {
   victory: number;
   name: string;
   texture?: string;
   planetId?: number;
}): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const victoryType = getVictoryType(victory);
   const battleResult = useRef<BattleResult>({
      victory,
      boosters: new Map([
         ["Evasion1", 1],
         ["HP1", 1],
      ]),
      resources: new Map([
         ["VictoryPoint", 1],
         ["XP", 0],
      ]),
   });
   const [value, breakdown] = calculateRewardValue(battleResult.current, G.save.state);
   const battleScore = round(victory * 100, 0);
   return (
      <div className="m10">
         <VictoryHeaderComp title={BattleVictoryTypeLabel[victoryType]()} />
         <div className="row text-lg">
            <TextureComp name="Others/Spaceship24" width={48} />
            <div>SS {G.save.state.name}</div>
            <div className="f1" />
            <div>{name}</div>
            <TextureComp name={texture ?? "Others/SpaceshipEnemy24"} width={48} />
         </div>
         <div className="h10" />
         <div className="row">
            <div className="f1 panel stretch">
               <div>
                  {BattleVictoryTypeLabel[victoryType]()} ({battleScore}%)
               </div>
            </div>
            <div className="f1 panel stretch" style={{ alignItems: "center" }}>
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Others/Trophy16" className="inline-middle" /> {t(L.VictoryPoint)}
                  </div>
                  <NumberSelect
                     value={battleResult.current.resources.get("VictoryPoint") ?? 0}
                     canIncrease={(value) => value < 9}
                     canDecrease={(value) => value > 0}
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
                        canIncrease={(value) => value < 9}
                        canDecrease={(value) => value > 0}
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
                  <div>100K</div>
               </div>
            </div>
         </div>
         <div className="row my10" style={{ fontSize: 30 }}>
            <div className="f1 text-center">{battleScore}</div>
            <div className="mi text-red" style={{ fontSize: 30 }}>
               sentiment_dissatisfied
            </div>
            <div className="f1 text-center">{value}</div>
         </div>
         <div className="text-center text-red my10">You ask for too much - it's unacceptable!</div>
         <Tooltip
            w={400}
            label={
               <>
                  <div>
                     You have {battleScore} battle score and the war reparation cannot exceed this. Your first Victory
                     Point and Booster are free and different boosters require additional score. The remaining score
                     will be converted to XP.
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
            <button className="btn w100 filled p5" disabled>
               Sign Peace Treaty
            </button>
         </Tooltip>
      </div>
   );
}
