import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { hideModal } from "../utils/ToggleModal";
import { ChangePlayerHandleComp } from "./ChangePlayerHandleComp";
import { RenderHTML } from "./components/RenderHTMLComp";

export function TutorialCommunityModal(): React.ReactNode {
   return (
      <>
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  web_traffic
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.TutorialGameControl)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialGameControlContent)} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  chat
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.TutorialChat)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialChatContent)} />
               <div className="h10" />
               <div className="panel">
                  <ChangePlayerHandleComp />
               </div>
               <div className="h10" />
            </div>
         </div>
         <button className="btn filled text-lg w100 py5 row" onClick={hideModal}>
            {t(L.StartPlaying)}
         </button>
      </>
   );
}
