import { notifications } from "@mantine/notifications";
import { showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { RPCClient } from "../rpc/RPCClient";
import { RenderHTML } from "../ui/components/RenderHTMLComp";
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
