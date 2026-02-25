import { TextInput } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { RenderHTML } from "./components/RenderHTMLComp";

export function TutorialBasicConceptModal(): React.ReactNode {
   return (
      <div className="m10">
         <div>
            <RenderHTML className="render-html" html={t(L.TutorialIntro)} />
         </div>
         <div className="h10" />
         <RenderHTML className="render-html" html={t(L.TutorialGameControlContent)} />
         <div className="h5" />
         <div className="text-dimmed panel p5 text-sm row g5 bg-dark">
            <div className="mi lg fstart">mouse</div>
            <RenderHTML className="render-html" html={t(L.TutorialAdvancedGameControlContent)} />
         </div>
         <div className="divider my10 mx-10" />
         <div className="text-dimmed mb5">{t(L.SpaceshipName)}</div>
         <TextInput
            className="f1"
            value={G.save.state.name}
            onChange={(e) => {
               G.save.state.name = e.target.value;
               GameStateUpdated.emit();
            }}
         />
         <div className="h10" />
         <button className="btn filled text-lg w100 py5 row" onClick={hideModal}>
            {t(L.StartPlaying)}
         </button>
      </div>
   );
}
