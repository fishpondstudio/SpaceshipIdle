import type React from "react";
import { useState } from "react";
import { useTypedEvent } from "../utils/Hook";
import { SetFloatingPanel, type IFloatingPanel } from "./FloatingPanelHelper";

export function FloatingPanel(): React.ReactNode {
   const [floatingPanel, setFloatingPanel] = useState<IFloatingPanel>();

   useTypedEvent(SetFloatingPanel, (e) => {
      setFloatingPanel(e);
   });

   if (!floatingPanel) {
      return null;
   }

   return (
      <div
         className="sf-frame"
         style={{
            position: "absolute",
            left: floatingPanel.rect.min.x,
            top: floatingPanel.rect.min.y,
            width: floatingPanel.rect.width,
            height: floatingPanel.rect.height,
         }}
      >
         {floatingPanel.content}
      </div>
   );
}
