import { CloseButton } from "@mantine/core";
import { hideSidebar } from "../Sidebar";

export function SidebarComp({
   title,
   children,
}: React.PropsWithChildren<{ title: React.ReactNode }>): React.ReactElement {
   return (
      <div
         className="sf-frame m10"
         style={{
            height: "calc(100vh - 20px)",
            display: "flex",
            flexDirection: "column",
         }}
      >
         <div className="row m10">
            <div className="f1">{title}</div>
            <CloseButton onClick={() => hideSidebar()} />
         </div>
         <div className="divider" />
         <div className="f1" style={{ overflow: "hidden auto" }}>
            {children}
         </div>
      </div>
   );
}
