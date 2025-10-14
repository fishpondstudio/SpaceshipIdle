import { SteamUrlWebFTUE } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import logo from "../../src/assets/images/logo.png";
import { isSteam, openUrl } from "../rpc/SteamClient";
import { OnLanguageChanged } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { html } from "./components/RenderHTMLComp";
import { TutorialBasicConceptModal } from "./TutorialBasicConceptModal";

export function NewPlayerModal(): React.ReactNode {
   refreshOnTypedEvent(OnLanguageChanged);
   return (
      <div className="m10">
         <img src={logo} className="w100 br5" />
         {html(t(L.WelcomeToSpaceshipIdle2ndPlaytest))}
         <div className="h10" />
         {!isSteam() ? (
            <div className="panel mb10 text-sm yellow row pointer" onClick={() => openUrl(SteamUrlWebFTUE)}>
               {t(L.GuestWebAccountWarning)}
               <div className="mi">open_in_new</div>
            </div>
         ) : null}
         <ChangeLanguageComp />
         <div className="h10" />
         <button
            className="btn filled text-lg w100 py5 row"
            onClick={() =>
               showModal({
                  title: t(L.TutorialIntroduction),
                  children: <TutorialBasicConceptModal />,
                  size: "lg",
               })
            }
         >
            {t(L.Next)}
         </button>
      </div>
   );
}
