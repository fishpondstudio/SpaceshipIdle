import { CloseButton, ScrollArea } from "@mantine/core";
import { hideSidebar } from "../Sidebar";

export function SidebarComp({
   title,
   children,
}: React.PropsWithChildren<{ title: React.ReactNode }>): React.ReactElement {
   return (
      <div
         className="sf-frame"
         style={{
            margin: "42px 10px 10px 10px",
            height: "calc(100vh - 60px - 10px)",
            display: "flex",
            flexDirection: "column",
         }}
      >
         <div className="row m10">
            <div className="f1">{title}</div>
            <CloseButton onClick={() => hideSidebar()} />
         </div>
         <div className="divider" />
         <ScrollArea scrollbars="y" className="f1">
            {children}
         </ScrollArea>
      </div>
   );
}
