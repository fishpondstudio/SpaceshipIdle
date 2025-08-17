import { capitalize } from "@spaceship-idle/shared/src/utils/Helper";
import { Generator } from "@spaceship-idle/shared/src/utils/NameGen";
import { G } from "../utils/Global";
import { VictoryHeaderComp } from "./components/BattleResultHeader";
import { TextureComp } from "./components/TextureComp";

export function PeaceTreatyModal(): React.ReactNode {
   const name = capitalize(new Generator("sVs").toString());
   return (
      <div className="m10">
         <VictoryHeaderComp title="Decisive Victory" />
         <div className="row text-lg">
            <TextureComp name="Others/Spaceship" width={32} />
            <div>SS {G.save.state.name}</div>
            <div className="f1" />
            <div>{name}</div>
            <TextureComp name="Others/Alien" width={32} />
         </div>
         <div className="h10" />
         <div className="row">
            <div className="f1 panel stretch">
               <div>Decisive Victory (62%)</div>
            </div>
            <div className="f1 panel stretch" style={{ alignItems: "center" }}>
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Booster/Evasion1" className="inline-middle" /> Evasion Cluster
                  </div>
                  <div className="mi">indeterminate_check_box</div>
                  <div className="text-center text-mono">1</div>
                  <div className="mi">add_box</div>
               </div>
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Booster/HP1" className="inline-middle" /> HP Cluster
                  </div>
                  <div className="mi">indeterminate_check_box</div>
                  <div className="text-center text-mono">2</div>
                  <div className="mi">add_box</div>
               </div>
               <div className="row">
                  <div className="f1">
                     <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
                  </div>
                  <div className="mi">indeterminate_check_box</div>
                  <div className="text-center text-mono">0</div>
                  <div className="mi">add_box</div>
               </div>
            </div>
         </div>
         <div className="row my10" style={{ fontSize: 30 }}>
            <div className="f1 text-center">62</div>
            <div className="mi text-red" style={{ fontSize: 30 }}>
               sentiment_dissatisfied
            </div>
            <div className="f1 text-center">67</div>
         </div>
         <div className="text-center text-red my10">You ask for too much - it's unacceptable!</div>
         <button className="btn w100 filled p5" disabled>
            Sign Peace Treaty
         </button>
      </div>
   );
}
