import { Tooltip } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { addResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { capitalize } from "@spaceship-idle/shared/src/utils/Helper";
import { Generator } from "@spaceship-idle/shared/src/utils/NameGen";
import { G } from "../utils/Global";
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
               <span className="text-space">{name}</span> is a neutral state. You can decide how do engage with them
            </div>
         </div>
         <div className="divider dashed"></div>
         <div className="m10 text-sm">
            Before making a decision, you can spend{" "}
            <span className="text-space">
               1 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
            </span>{" "}
            to build a spy network to reveal more information about them
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
               <Tooltip
                  label={
                     <>
                        <div>The cost of declaring friendship is determined as follows</div>
                        <div className="flex-table mx-10 mt5">
                           <div className="row">
                              <div className="f1">Base Cost</div>
                              <div>
                                 1 <TextureComp name="Others/Trophy16" className="inline-middle" />
                              </div>
                           </div>
                           <div className="row">
                              <div className="f1">Warmonger Penalty</div>
                              <div>
                                 2 <TextureComp name="Others/Trophy16" className="inline-middle" />
                              </div>
                           </div>
                           <div className="row">
                              <div className="f1">Backstabbing Penalty</div>
                              <div>
                                 1 <TextureComp name="Others/Trophy16" className="inline-middle" />
                              </div>
                           </div>
                        </div>
                     </>
                  }
               >
                  <div>
                     4 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
                  </div>
               </Tooltip>
               <div className="divider my10 mx-10" />
               <div className="title">Rewards</div>
               <div className="h5" />
               <div>
                  1 <TextureComp name="Booster/Evasion1" className="inline-middle" /> Evasion Cluster
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
               <div className="title">Cost</div>
               <div className="h5" />
               <Tooltip
                  label={
                     <>
                        <div>The cost of declaring war is determined as follows</div>
                        <div className="flex-table mx-10 mt5">
                           <div className="row">
                              <div className="f1">Warmonger Penalty</div>
                              <div>
                                 2 <TextureComp name="Others/Trophy16" className="inline-middle" />
                              </div>
                           </div>
                        </div>
                     </>
                  }
               >
                  <div>
                     2 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
                  </div>
               </Tooltip>
               <div className="divider my10 mx-10" />
               <div className="title">Negotiable Rewards</div>
               <div className="h5" />
               <div>
                  <TextureComp name="Booster/Evasion1" className="inline-middle" /> Evasion Cluster
               </div>
               <div>
                  <TextureComp name="Booster/HP1" className="inline-middle" /> HP Cluster
               </div>
               <div>
                  <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
               </div>
               <div>
                  <TextureComp name="Others/XP" className="inline-middle" /> XP
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
                  addResource("Warmonger", 1, G.save.state.resources);
                  GameStateUpdated.emit();
               }}
            >
               <div className="mi sm">swords</div>
               <div>Declare War</div>
            </button>
         </div>
      </SidebarComp>
   );
}
