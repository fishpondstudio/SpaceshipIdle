import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { saveGame } from "../game/LoadSave";
import { ShipImageComp } from "../game/ShipImageComp";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { showModal } from "../utils/ToggleModal";
import { usePromise } from "../utils/UsePromise";
import { DevOrAdminOnly } from "./components/DevOnly";
import { MatchmakingShipComp } from "./MatchmakingShipComp";
import { PreBattleModal } from "./PreBattleModal";
import { ShipGalleryModal } from "./ShipGalleryModal";

export function ViewShipModal({ id }: { id: string }): React.ReactNode {
   const ship = usePromise(RPCClient.viewShip(id), [id]);
   if (!ship) {
      return null;
   }
   return (
      <div className="m10">
         <div className="row" style={{ alignItems: "stretch" }}>
            <button
               className="btn text-sm"
               onClick={() => {
                  showModal({ children: <ShipGalleryModal />, title: t(L.ShipRanking), size: "xl", dismiss: true });
               }}
            >
               <div className="mi">arrow_back</div>
            </button>
            <button
               className="btn text-sm"
               onClick={() => {
                  showModal({
                     children: <PreBattleModal enemy={ship.json} info={{}} />,
                     size: "lg",
                     dismiss: true,
                  });
               }}
            >
               {t(L.PracticeBattle)}
            </button>
            <div className="f1" />
            <DevOrAdminOnly>
               <>
                  <button
                     className="btn text-sm red"
                     onClick={async () => {
                        G.save.state = ship.json;
                        await saveGame(G.save);
                        window.location.reload();
                     }}
                  >
                     Load
                  </button>
                  <button
                     className="btn text-sm red"
                     onClick={async () => {
                        await RPCClient.deleteShip(id);
                        showModal({
                           children: <ShipGalleryModal />,
                           title: t(L.ShipRanking),
                           size: "xl",
                           dismiss: true,
                        });
                     }}
                  >
                     Delete
                  </button>
               </>
            </DevOrAdminOnly>
         </div>
         <div className="h10" />
         <div className="panel bg-dark">
            <MatchmakingShipComp ship={ship.json} />
         </div>
         <div className="h10" />
         <ShipImageComp ship={ship.json} side={Side.Left} />
      </div>
   );
}
