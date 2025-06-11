import { Config } from "@spaceship-idle/shared/src/game/Config";
import { calcSpaceshipXP, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { getTechName } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { saveGame } from "../game/LoadSave";
import { ShipImageComp } from "../game/ShipImageComp";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { showModal } from "../utils/ToggleModal";
import { usePromise } from "../utils/UsePromise";
import { DevOrAdminOnly } from "./components/DevOnly";
import { MatchMakingModal } from "./MatchmakingModal";
import { ShipGalleryModal } from "./ShipGalleryModal";

export function ViewShipModal({ id }: { id: string }): React.ReactNode {
   const ship = usePromise(RPCClient.viewShip(id), [id]);
   if (!ship) {
      return null;
   }
   return (
      <>
         <div className="panel bg-dark">
            <div className="row text-space">
               <div>{t(L.SpaceshipPrefix, ship.json.name)}</div>
               <div className="f1" />
            </div>
            <div className="row">
               <div className="f1">{t(L.Quantum)}</div>
               <div>{formatNumber(getUsedQuantum(ship.json))}</div>
            </div>
            <div className="row">
               <div className="f1">{t(L.SpaceshipXP)}</div>
               <div>{formatNumber(calcSpaceshipXP(ship.json))}</div>
            </div>
            <div className="divider mx-10 my10" />
            <div className="f1">{t(L.Research)}</div>
            <div className="text-sm">
               {Array.from(ship.json.unlockedTech)
                  .map((tech) => getTechName(tech))
                  .join(", ")}
            </div>{" "}
            <div className="divider mx-10 my10" />
            <div className="f1">{t(L.ElementThisRun)}</div>
            <div className="text-sm">
               {mMapOf(ship.json.elements, (element, amount) => {
                  const building = Config.Element.get(element);
                  if (!building) {
                     return null;
                  }
                  return (
                     <div className="row" key={element}>
                        <div>
                           {element} <span className="text-dimmed">({Config.Buildings[building].name()})</span>
                        </div>
                        <div className="f1 text-right">{amount}</div>
                     </div>
                  );
               })}
            </div>
         </div>
         <div className="h10" />
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
                     children: <MatchMakingModal enemy={ship.json} />,
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
                        G.save.current = ship.json;
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
         <ShipImageComp ship={ship.json} side={Side.Left} />
      </>
   );
}
