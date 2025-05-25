import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { showModal } from "../utils/ToggleModal";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { TutorialQuantumModal } from "./TutorialQuantumModal";

export function TutorialBasicConceptModal(): React.ReactNode {
   return (
      <>
         <div>
            <RenderHTML className="render-html" html={t(L.TutorialIntro)} />
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <TextureComp name={"Building/SolarPower"} size={50} />
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.Power)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialPower)} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <div className="mi" style={{ fontSize: 50 }}>
                  view_in_ar
               </div>
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.XP)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialXP)} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="fstart">
               <TextureComp name={"Building/AC30"} size={50} />
            </div>
            <div className="f1">
               <div className="text-lg text-space">{t(L.TutorialWeapon)}</div>
               <RenderHTML className="render-html" html={t(L.TutorialWeaponContent)} />
            </div>
         </div>
         <div className="h10" />
         <button
            className="btn filled text-lg w100 py5 row"
            onClick={() =>
               showModal({
                  title: t(L.TutorialQuantum),
                  children: <TutorialQuantumModal />,
                  size: "lg",
               })
            }
         >
            {t(L.Next)}
         </button>
      </>
   );
}
