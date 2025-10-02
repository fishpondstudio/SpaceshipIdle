import { notifications } from "@mantine/notifications";
import { showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { RPCClient } from "../rpc/RPCClient";
import { playBling, playError } from "../ui/Sound";

export function handleCommand(command: string): void {
   RPCClient.sendCommand(command)
      .then(async (message) => {
         playBling();
         notifications.show({
            message,
            position: "top-center",
            color: "blue",
            withBorder: true,
            autoClose: false,
         });
      })
      .catch((e) => {
         playError();
         showError(String(e));
      });
}
