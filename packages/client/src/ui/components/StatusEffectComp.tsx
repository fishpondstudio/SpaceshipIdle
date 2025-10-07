import { StatusEffectFlag, StatusEffects } from "@spaceship-idle/shared/src/game/definitions/StatusEffect";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { hasFlag, mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import type { ITileWithGameState } from "../ITileWithGameState";
import { TitleComp } from "./TitleComp";

export function StatusEffectComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const rs = G.runtime.get(tile);
   if (!rs || rs.statusEffects.size === 0) {
      return null;
   }
   return (
      <>
         <div className="divider my10" />
         <TitleComp>
            <div className="f1">{t(L.StatusEffect)}</div>
            <div>{rs.statusEffects.size}</div>
         </TitleComp>
         <div className="divider my10" />
         <div className="mx10">
            {mMapOf(rs.statusEffects, (tile, se) => {
               const sd = StatusEffects[se.statusEffect];
               return (
                  <div className="row my10" key={tile}>
                     {hasFlag(sd.flag, StatusEffectFlag.Positive) ? (
                        <div className="mi text-green">add_circle</div>
                     ) : null}
                     {hasFlag(sd.flag, StatusEffectFlag.Negative) ? (
                        <div className="mi text-red">do_not_disturb_on</div>
                     ) : null}
                     <div className="f1">
                        <div className="text-sm">{sd.name()}</div>
                        <div className="text-xs text-dimmed">
                           {sd.desc(se.value)} ({getBuildingName(se.sourceType)})
                        </div>
                     </div>
                     {Number.isFinite(se.timeLeft) ? (
                        <div>{Math.ceil(se.timeLeft) + 1}s</div>
                     ) : (
                        <div className="mi">all_inclusive</div>
                     )}
                  </div>
               );
            })}
         </div>
      </>
   );
}
