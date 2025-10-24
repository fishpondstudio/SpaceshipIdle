import type { Addon } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { AddonComp } from "./components/AddonComp";

export function AddonModal({ addon }: { addon: Addon }): React.ReactNode {
   return (
      <div className="m10">
         <AddonComp addon={addon} showDetails showCraft />
      </div>
   );
}
