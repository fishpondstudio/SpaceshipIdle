import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { SidebarComp } from "./components/SidebarComp";

export function NotWithinExtentPage(): React.ReactNode {
   return (
      <SidebarComp title={t(L.Build)}>
         <div className="m10">
            <div
               className="p10 row text-red text-sm mb10"
               style={{
                  border: "1px solid var(--mantine-color-red-4)",
                  borderRadius: 5,
               }}
            >
               <div className="mi lg">error</div>
               <div className="f1">{t(L.NotWithinExtent)}</div>
            </div>
         </div>
      </SidebarComp>
   );
}
