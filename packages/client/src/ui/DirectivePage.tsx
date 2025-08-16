import { RingProgress } from "@mantine/core";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";

export function DirectivePage(): React.ReactNode {
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Directive24" />
               <div className="f1">Directives</div>
            </div>
         }
      >
         <div className="m10">
            <button className="btn filled w100 row px10 py5">
               <div>Roll 1 Directive</div>
               <div className="f1" />
               <div>
                  -1 <TextureComp name="Others/Trophy16" className="inline-middle" />
               </div>
            </button>
         </div>
         <div className="divider my10" />
         <div className="title">
            <div className="mi mr5">play_circle</div>
            Active Directives
         </div>
         <div className="divider my10" />
         <DirectiveItem />
         <div className="divider my10" />
         <div className="title">
            <div className="mi mr5">do_not_disturb_on</div>
            Queued Directives
         </div>
         <div className="divider my10" />
         <DirectiveItem />
         <DirectiveItem />
      </SidebarComp>
   );
}

function DirectiveItem(): React.ReactNode {
   return (
      <div className="panel m10 row text-sm">
         <div>
            <div className="row g5">
               <div className="mi text-green">check_circle</div>
               <div className="f1">Equip 2 Boosters</div>
            </div>
            <div className="row g5">
               <div className="mi">bubble</div>
               <div className="f1">All modules equipped with a booster get +1 HP Multiplier</div>
            </div>
            <div className="h5" />
            <div className="row g5">
               <button className="btn p0">
                  <div className="mi sm">vertical_align_top</div>
               </button>
               <button className="btn p0">
                  <div className="mi sm">arrow_upward</div>
               </button>
               <button className="btn p0">
                  <div className="mi sm">arrow_downward</div>
               </button>
               <button className="btn p0">
                  <div className="mi sm">vertical_align_bottom</div>
               </button>
               <button className="btn p0">
                  <div className="mi sm">recycling</div>
               </button>
               <div className="f1" />
            </div>
         </div>
         <div className="f1" />
         <div>
            <RingProgress size={75} thickness={10} roundCaps sections={[{ value: 40, color: "green" }]} />
            <div className="text-center text-sm">02:23</div>
         </div>
      </div>
   );
}
