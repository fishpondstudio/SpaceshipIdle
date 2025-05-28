import { calcSpaceshipValue, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { getTechName } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ShipImageComp } from "../game/ShipImageComp";
import { RPCClient } from "../rpc/RPCClient";
import { showModal } from "../utils/ToggleModal";
import { usePromise } from "../utils/UsePromise";
import { ShipGalleryModal } from "./ShipGalleryModal";
import { DevOrAdminOnly } from "./components/DevOnly";

export function ViewShipModal({ id }: { id: string }): React.ReactNode {
   const ship = usePromise(RPCClient.viewShip(id), [id]);
   if (!ship) {
      return null;
   }
   return (
      <>
         <div className="panel bg-dark">
            <div className="row">
               <div className="f1">{t(L.Quantum)}</div>
               <div>{formatNumber(getUsedQuantum(ship.json))}</div>
            </div>
            <div className="row">
               <div className="f1">{t(L.SpaceshipXP)}</div>
               <div>{formatNumber(calcSpaceshipValue(ship.json))}</div>
            </div>
            <div className="divider mx-10 my10" />
            <div className="f1">{t(L.Research)}</div>
            <div>
               {Array.from(ship.json.unlockedTech)
                  .map((tech) => getTechName(tech))
                  .join(", ")}
            </div>
         </div>
         <div className="h10" />
         <DevOrAdminOnly>
            <div className="row">
               <button
                  className="btn text-sm"
                  onClick={async () => {
                     await RPCClient.deleteShip(id);
                     showModal({
                        children: <ShipGalleryModal />,
                        title: t(L.ShipGallery),
                        size: "xl",
                        dismiss: true,
                     });
                  }}
               >
                  Delete
               </button>
               <button
                  className="btn text-sm"
                  onClick={async () => {
                     await RPCClient.setBaseline(id);
                     showModal({
                        children: <ShipGalleryModal />,
                        title: t(L.ShipGallery),
                        size: "xl",
                        dismiss: true,
                     });
                  }}
               >
                  Set Baseline
               </button>
               <div className="f1" />
            </div>
         </DevOrAdminOnly>
         <div className="h10" />
         <ShipImageComp ship={ship.json} side={Side.Left} />
      </>
   );
}
