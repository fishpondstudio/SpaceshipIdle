import { notifications } from "@mantine/notifications";
import { RPCClient } from "../rpc/RPCClient";
import { playBling, playError } from "../ui/Sound";
import { RenderHTML } from "../ui/components/RenderHTMLComp";

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

function CommandOutput({ command, result }: { command: string; result: string }): React.ReactNode {
   return (
      <div className="text-mono">
         <div className="row">
            <div className="mi">terminal</div>
            <div className="f1">{command}</div>
         </div>
         <div className="divider my5" />
         <RenderHTML html={result.split("\n").join("<br>")} />
      </div>
   );
}
