import type React from "react";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

export function AugmentPage(): React.ReactNode {
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Propeller" />
               <div className="f1">Augment</div>
            </div>
         }
      >
         <div className="panel m10">
            <div>-1 Minimum Warmonger Penalty</div>
            <div className="divider dashed mx-10 my10" />
            <div className="row">
               <div>Level 3</div>
               <div className="f1" />
               <button className="btn">Upgrade</button>
               <button className="btn">Reset</button>
            </div>
         </div>
      </SidebarComp>
   );
}
