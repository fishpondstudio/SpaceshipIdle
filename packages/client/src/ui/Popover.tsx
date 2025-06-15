import type React from "react";
import { useState } from "react";
import { useTypedEvent } from "../utils/Hook";
import { SetPopover, type IPopover } from "./PopoverHelper";

export function Popover(): React.ReactNode {
   const [popover, setPopover] = useState<IPopover>();

   useTypedEvent(SetPopover, (e) => {
      setPopover(e);
   });

   if (!popover) {
      return null;
   }

   return (
      <div
         className="sf-frame"
         style={{
            position: "absolute",
            left: popover.rect.min.x,
            top: popover.rect.min.y,
            width: popover.rect.width,
            height: popover.rect.height,
         }}
      >
         {popover.content}
      </div>
   );
}
