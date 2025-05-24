import { Box, Divider, Group, Paper, Space } from "@mantine/core";
import { calculateSpaceshipValue, usedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { techName } from "@spaceship-idle/shared/src/game/logic/TechLogic";
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
         <Paper withBorder p="xs" fz="sm">
            <Group>
               <Box flex={1}>{t(L.Quantum)}</Box>
               <Box>{formatNumber(usedQuantum(ship.json))}</Box>
            </Group>
            <Group>
               <Box flex={1}>{t(L.SpaceshipValue)}</Box>
               <Box>{formatNumber(calculateSpaceshipValue(ship.json))}</Box>
            </Group>
            <Space h="sm" />
            <Divider mx="-xs" />
            <Space h="sm" />
            <Box c="space" flex={1}>
               {t(L.Research)}
            </Box>
            <Box>
               {Array.from(ship.json.unlockedTech)
                  .map((tech) => techName(tech))
                  .join(", ")}
            </Box>
         </Paper>
         <Space h="sm" />
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
         <Space h="sm" />
         <ShipImageComp ship={ship.json} side={Side.Left} />
      </>
   );
}
