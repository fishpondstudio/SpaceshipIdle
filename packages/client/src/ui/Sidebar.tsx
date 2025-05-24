import { Transition } from "@mantine/core";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useState } from "react";
import { useTypedEvent } from "../utils/Hook";

export const UpdateSidebar = new TypedEvent<React.ReactNode>();
export const ToggleSidebar = new TypedEvent<boolean>();

export function setSidebar(content: React.ReactNode) {
   UpdateSidebar.emit(content);
}

export function hideSidebar() {
   ToggleSidebar.emit(false);
}

export const SidebarWidth = 400;

export function Sidebar(): React.ReactNode {
   const [sidebar, setSidebar] = useState<React.ReactNode>();
   const [mounted, setMounted] = useState(false);
   useTypedEvent(UpdateSidebar, (e) => {
      setSidebar(e);
      setMounted(true);
   });
   useTypedEvent(ToggleSidebar, (e) => {
      setMounted(e);
   });
   return (
      <Transition
         mounted={mounted}
         transition="fade-left"
         onExited={() => {
            setSidebar(null);
         }}
      >
         {(styles) => (
            <div
               style={{
                  ...styles,
                  width: SidebarWidth,
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
               }}
            >
               {sidebar}
            </div>
         )}
      </Transition>
   );
}
