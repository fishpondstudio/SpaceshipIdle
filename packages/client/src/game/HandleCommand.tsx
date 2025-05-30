import { notifications } from "@mantine/notifications";
import { RPCClient } from "../rpc/RPCClient";
import { CommandOutput } from "../ui/ChatPanel";
import { playBling, playError } from "../ui/Sound";

export function handleCommand(command: string): void {
   RPCClient.sendCommand(command)
      .then(async (message) => {
         playBling();
         notifications.show({
            message: <CommandOutput command={command} result={message} />,
            color: "blue",
            autoClose: false,
            position: "top-center",
         });
      })
      .catch((e) => {
         playError();
         notifications.show({
            message: <CommandOutput command={command} result={String(e)} />,
            color: "red",
            autoClose: false,
            position: "top-center",
         });
      });
}
