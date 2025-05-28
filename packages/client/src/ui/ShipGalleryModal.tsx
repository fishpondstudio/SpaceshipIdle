import { notifications } from "@mantine/notifications";
import { getShipScoreRank } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import type { IShip } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { classNames } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useEffect, useState } from "react";
import { loadGameStateFromFile, saveGame, saveGameStateToFile } from "../game/LoadSave";
import { ShipImageComp } from "../game/ShipImageComp";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { showModal } from "../utils/ToggleModal";
import { DevOrAdminOnly } from "./components/DevOnly";
import { playError } from "./Sound";
import { ViewShipModal } from "./ViewShipModal";

const PerPage = 9;

export function ShipGalleryModal(): React.ReactNode {
   const [counter, setCounter] = useState(0);
   const [page, setPage] = useState(0);
   const [result, setResult] = useState<{ total: number; ships: IShip[] } | null>(null);
   const [quantum, setQuantum] = useState(30);
   useEffect(() => {
      RPCClient.rankShips(quantum, 9).then((ships) => {
         setResult({ total: 9, ships });
      });
   }, [quantum]);
   const totalPages = Math.ceil((result?.total ?? 0) / PerPage);
   return (
      <>
         <div className="row mb10 fstart">
            {[30, 40, 50, 60, 70, 80, 90].map((q) => {
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
         <DevOrAdminOnly>
            <div className="row text-sm mt10">
               <button
                  className="btn red f1"
                  onClick={async () => {
                     try {
                        G.save.current = await loadGameStateFromFile();
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
                  className="btn red f1"
                  onClick={() => {
                     saveGameStateToFile(G.save.current);
                  }}
               >
                  Export
               </button>
               <button
                  className="btn red f1"
                  onClick={async () => {
                     try {
                        await RPCClient.saveShip(G.save.current, 1);
                        setCounter(counter + 1);
                     } catch (e) {
                        playError();
                        notifications.show({ position: "top-center", color: "red", message: String(e) });
                     }
                  }}
               >
                  Save
               </button>
            </div>
         </DevOrAdminOnly>
      </>
   );
}
