import { capitalize } from "@spaceship-idle/shared/src/utils/Helper";
import { Generator } from "@spaceship-idle/shared/src/utils/NameGen";
import { showModal } from "../utils/ToggleModal";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { PeaceTreatyModal } from "./PeaceTreatyModal";

export function GalaxyPage(): React.ReactNode {
   const name = capitalize(new Generator("sVs").toString());
   return (
      <SidebarComp
         title={
            <div className="row">
               <TextureComp name="Others/Alien" />
               <div className="f1">{name}</div>
            </div>
         }
      >
         <div className="m10 text-sm">
            <div>
               <span className="text-space">{name}</span> is a neutral state. You can decide how do engage with them.
               Your decision is final: it cannot be undone
            </div>
         </div>
         <div className="divider dashed"></div>
         <div className="m10 text-sm">
            Before making a decision, you can spend <span className="text-space">1 Victory Point</span>{" "}
            <TextureComp name="Others/Trophy16" className="inline-middle" /> to build a spy network to reveal more
            information about them
         </div>
         <div className="mx10">
            <button className="btn w100 row g5">
               <div className="mi sm">visibility</div>
               <div>Build Spy Network</div>
            </button>
         </div>
         <div className="divider my10" />
         <div className="title g5">
            <div className="mi sm">handshake</div>
            <div>Declare Friendship</div>
         </div>
         <div className="divider my10" />
         <div className="m10">
            <div className="panel">
               <div className="title">Cost</div>
               <div className="h5" />
               <div>
                  1 Victory Point <TextureComp name="Others/Trophy16" className="inline-middle" />
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">Rewards</div>
               <div className="h5" />
               <div>
                  +1 <span className="text-space">Evasion Cluster</span>{" "}
                  <TextureComp name="Booster/Evasion1" className="inline-middle" />
               </div>
            </div>
            <div className="h10" />
            <button className="btn green w100 row g5">
               <div className="mi sm">handshake</div>
               <div>Declare Friendship</div>
            </button>
         </div>
         <div className="divider my10" />
         <div className="title g5">
            <div className="mi sm">swords</div>
            <div>Declare War</div>
         </div>
         <div className="divider my10" />
         <div className="m10">
            <div className="panel">
               <div className="title">Negotiable</div>
               <div className="h5" />
               <div>
                  Evasion Cluster <TextureComp name="Booster/Evasion1" className="inline-middle" />
               </div>
               <div>
                  HP Cluster <TextureComp name="Booster/HP1" className="inline-middle" />
               </div>
               <div>
                  Victory Point <TextureComp name="Others/Trophy16" className="inline-middle" />
               </div>
               <div>
                  Officer Candidate <TextureComp name="Others/Officer" className="inline-middle" />
               </div>
               <div>
                  XP <TextureComp name="Others/XP" className="inline-middle" />
               </div>
            </div>
            <div className="h5" />
            <div className="text-xs text-dimmed">
               War reparation is negotiated when signing the peace treaty and depends on battle outcome
            </div>
            <div className="h5" />
            <button
               className="btn red w100 row g5"
               onClick={() => {
                  showModal({ children: <PeaceTreatyModal />, size: "lg" });
               }}
            >
               <div className="mi sm">swords</div>
               <div>Declare War</div>
            </button>
         </div>
      </SidebarComp>
   );
}
