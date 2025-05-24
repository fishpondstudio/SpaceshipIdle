import { Image } from "@mantine/core";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import NotConnected from "../assets/images/NotConnected.png";
import { SidebarComp } from "./components/SidebarComp";

export function NotConnectedPage(): React.ReactNode {
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
               <div className="f1">{t(L.NotConnected)}</div>
            </div>
            <Image radius="sm" src={NotConnected} />
         </div>
      </SidebarComp>
   );
}
