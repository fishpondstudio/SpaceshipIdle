import { useForceUpdate } from "@mantine/hooks";
import { getShipScoreRank } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import type { IShip } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { classNames } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useEffect, useState } from "react";
import { ShipImageComp } from "../game/ShipImageComp";
import { RPCClient } from "../rpc/RPCClient";
import { showModal } from "../utils/ToggleModal";
import { ViewShipModal } from "./ViewShipModal";

export function ShipGalleryModal(): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const [result, setResult] = useState<{ total: number; ships: IShip[] } | null>(null);
   const [quantum, setQuantum] = useState(30);
   useEffect(() => {
      RPCClient.rankShips(quantum, 9).then((ships) => {
         setResult({ total: 9, ships });
      });
   }, [quantum]);
   return (
      <>
         <div className="row mb10 fstart wrap">
            {[30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((q) => {
               return (
                  <button
                     key={q}
                     className={classNames("btn", q === quantum ? "filled" : null)}
                     onClick={() => {
                        setQuantum(q);
                     }}
                  >
                     Q{q}
                  </button>
               );
            })}
         </div>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {result?.ships?.map((ship, idx) => (
               <div
                  className="panel pointer"
                  key={ship.shipId}
                  onClick={() => {
                     showModal({
                        title: t(L.ViewShip),
                        children: <ViewShipModal id={ship.shipId} />,
                        size: "md",
                        dismiss: true,
                     });
                  }}
               >
                  <ShipImageComp ship={ship.json} side={Side.Left} h={200} fit="contain" />
                  <div className="divider mx-10 my5" />
                  <div className="row text-sm mb-5">
                     <div className="text-space">{idx + 1}</div>
                     <div>{t(L.SpaceshipPrefix, ship.json.name)}</div>
                     <div className="f1" />
                     <div>
                        {ship.quantum} ({getShipScoreRank(ship.score)})
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </>
   );
}
