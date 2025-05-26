import { Button, Paper, SimpleGrid, Space } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getShipScoreRank } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { classNames, range } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { loadGameStateFromFile, saveGame, saveGameStateToFile } from "../game/LoadSave";
import { ShipImageComp } from "../game/ShipImageComp";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { showModal } from "../utils/ToggleModal";
import { usePromise } from "../utils/UsePromise";
import { playError } from "./Sound";
import { ViewShipModal } from "./ViewShipModal";
import { DevOrAdminOnly } from "./components/DevOnly";

const PerPage = 9;

export function ShipGalleryModal(): React.ReactNode {
   const [counter, setCounter] = useState(0);
   const [page, setPage] = useState(0);
   const result = usePromise(RPCClient.listShips(PerPage, page * PerPage), [counter, page, setPage]);
   const totalPages = Math.ceil((result?.total ?? 0) / PerPage);
   return (
      <>
         <DevOrAdminOnly>
            <div className="row">
               <button
                  className="btn w100"
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
                  className="btn w100"
                  onClick={() => {
                     saveGameStateToFile(G.save.current);
                  }}
               >
                  Export
               </button>
               <button
                  className="btn w100"
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
         <Space h="sm" />
         <SimpleGrid cols={3}>
            {result?.ships?.map((ship) => (
               <Paper p="xs" key={ship.shipId} withBorder>
                  <ShipImageComp ship={ship.json} side={Side.Left} h={200} fit="contain" />
                  <Button
                     mt="xs"
                     key={ship.shipId}
                     size="compact-sm"
                     variant="outline"
                     onClick={() => {
                        showModal({
                           title: t(L.ViewShip),
                           children: <ViewShipModal id={ship.shipId} />,
                           size: "md",
                           dismiss: true,
                        });
                     }}
                     justify="space-between"
                     leftSection={t(L.SpaceshipPrefix, ship.json.name)}
                     rightSection={`${ship.quantum} (${getShipScoreRank(ship.score)})`}
                     fullWidth
                  ></Button>
               </Paper>
            ))}
         </SimpleGrid>
         <div className="h10" />
         <div className="row text-sm">
            {range(0, totalPages).map((p) => (
               <button key={p} className={classNames("btn", p === page ? "filled" : null)} onClick={() => setPage(p)}>
                  {p + 1}
               </button>
            ))}
         </div>
      </>
   );
}
