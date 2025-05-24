import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { getNonWeaponBuildingXP } from "@spaceship-idle/shared/src/game/logic/ProductionLogic";
import { formatNumber, isEmpty, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import type { ITileWithGameState } from "../ITileWithGameState";
import { RenderHTML } from "./RenderHTMLComp";
import { ResourceAmount } from "./ResourceAmountComp";

export function ProductionComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const def = Config.Buildings[data?.type];
   if (isEmpty(def.input) && isEmpty(def.output)) {
      return null;
   }
   const rs = G.runtime.get(tile);
   if (!rs) {
      return null;
   }
   return (
      <div className="mx10">
         <div className="subtitle my10">{t(L.Production)}</div>
         <div className="row text-sm">
            <div className="f1">
               {mapOf(def.input, (res, amount) => {
                  return (
                     <div className="row" style={{ justifyContent: "flex-start" }} key={res}>
                        <ResourceAmount res={res} amount={amount * data.level * data.capacity} />{" "}
                        {Config.Resources[res].name()}
                        {rs.insufficient.has(res) ? <div className="mi sm text-yellow">error</div> : null}
                     </div>
                  );
               })}
            </div>
            {rs.insufficient.size > 0 ? (
               <div className="mi lg text-red">warning</div>
            ) : (
               <div className="mi lg text-green">arrow_circle_right</div>
            )}
            <div className="f1">
               {mapOf(def.output, (res, amount) => {
                  return (
                     <div className="row" style={{ justifyContent: "flex-end" }} key={res}>
                        <ResourceAmount
                           res={res}
                           amount={amount * data.level * data.capacity * rs.productionMultiplier.value}
                        />{" "}
                        {Config.Resources[res].name()}
                     </div>
                  );
               })}
            </div>
         </div>
         {rs.productionMultiplier.detail.length > 0 ? (
            <>
               <div className="subtitle my10">
                  {t(L.ProductionMultiplier)} x{formatNumber(rs.productionMultiplier.value)}
               </div>
               <div className="row text-sm">
                  <div className="f1">{t(L.BaseMultiplier)}</div>
                  <div>1</div>
               </div>
               {rs.productionMultiplier.detail.map((m) => {
                  return (
                     <div className="row text-sm" key={m.source}>
                        <div className="f1">{m.source}</div>
                        <div className="text-green">+{formatNumber(m.value)}</div>
                     </div>
                  );
               })}
            </>
         ) : null}
         {!(WeaponKey in def) && rs.xpMultiplier.value > 1 ? (
            <>
               <div className="subtitle">
                  {t(L.XPMultiplier)} x${rs.xpMultiplier.value - 1}
               </div>
               {rs.xpMultiplier.detail.map((m) => {
                  return (
                     <div className="row text-sm" key={m.source}>
                        <div className="f1">{m.source}</div>
                        <div className="text-green">+{formatNumber(m.value)}</div>
                     </div>
                  );
               })}
               <div className="row text-sm">
                  <div className="f1"></div>
                  <Tooltip maw="30vw" multiline label={<RenderHTML html={t(L.ProductionBuildingXPHTML)} />}>
                     <div className="text-space">
                        +{formatNumber(getNonWeaponBuildingXP(rs))} {t(L.XP)}
                     </div>
                  </Tooltip>
               </div>
            </>
         ) : null}
      </div>
   );
}
