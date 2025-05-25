import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { showModal } from "../utils/ToggleModal";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TutorialCommunityModal } from "./TutorialCommunityModal";

export function TutorialQuantumModal(): React.ReactNode {
   return (
      <>
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  orbit
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.Quantum)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialQuantumContent)} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  swords
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.QualifierBattle)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialQualifierBattle)} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  category
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.TutorialElement)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialElementContent)} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  explosion
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.TutorialAutoBattle)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialAutoBattleContent)} />
            </div>
         </div>
         <div className="h10" />
         <button
            className="btn filled text-lg w100 py5 row"
            onClick={() =>
               showModal({
                  title: t(L.TutorialCommunity),
                  children: <TutorialCommunityModal />,
                  size: "lg",
               })
            }
         >
            {t(L.Next)}
         </button>
      </>
   );
}
