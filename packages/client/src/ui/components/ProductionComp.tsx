import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { classNames, formatNumber, isEmpty, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import type { ITileWithGameState } from "../ITileWithGameState";
import { RenderHTML } from "./RenderHTMLComp";
import { ResourceAmount } from "./ResourceAmountComp";
import { TextureComp } from "./TextureComp";
import { TitleComp } from "./TitleComp";

export function ProductionComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const def = Config.Buildings[data?.type];
   if (isEmpty(def.input) && isEmpty(def.output)) {
      return null;
   }
   if (data.type === "XPCollector") {
      return null;
   }
   const rs = G.runtime.get(tile);
   if (!rs) {
      return null;
   }
   return (
      <>
         <div className="divider my10" />
         <TitleComp>{t(L.Production)}</TitleComp>
         <div className="divider my10" />
         {def.input.Power ? (
            <>
               <div className="row mx10 g5">
                  <div className="f1">{t(L.Power)}</div>
                  {rs.insufficient.has("Power") ? (
                     <Tooltip label={t(L.InsufficientResourceTooltip, t(L.Power))}>
                        <div className="mi text-red">warning</div>
                     </Tooltip>
                  ) : (
                     <div className="mi">bolt</div>
                  )}
                  <div className={classNames(rs.insufficient.has("Power") ? "text-red" : null)}>
                     <ResourceAmount res="Power" amount={def.input.Power * data.level * data.capacity} />
                  </div>
               </div>
               <div className="divider dashed my10" />
            </>
         ) : null}
         <div className="col stretch mx10 text-condensed">
            <div className="f1 col g5 stretch">
               {mapOf(def.input, (res, amount) => {
                  if (res === "Power") {
                     return null;
                  }
                  return (
                     <Tooltip
                        multiline
                        maw="30vw"
                        key={res}
                        disabled={!rs.insufficient.has(res)}
                        label={<RenderHTML html={t(L.InsufficientResourceTooltip, Config.Resources[res].name())} />}
                     >
                        <div className={classNames("panel f1 p5", rs.insufficient.has(res) ? "red" : null)}>
                           <div className={classNames("row g5", rs.insufficient.has(res) ? "text-red" : null)}>
                              <div>
                                 <TextureComp name={`Building/${Config.ResourceToBuilding.get(res)}`} width={30} />
                              </div>
                              <div>{Config.Resources[res].name()}</div>
                              <div className="f1" />
                              <ResourceAmount res={res} amount={amount * data.level * data.capacity} />
                              {rs.insufficient.has(res) ? <div className="mi sm inline">error</div> : null}
                           </div>
                        </div>
                     </Tooltip>
                  );
               })}
            </div>
            <div className={classNames("mi lg text-center", rs.insufficient.size > 0 ? "text-red" : "text-green")}>
               keyboard_double_arrow_down
            </div>
            <div className="f1 col g5 stretch">
               {mapOf(def.output, (res, amount) => {
                  return (
                     <div className="panel f1 p5" key={res}>
                        <div className={classNames("row g5", rs.insufficient.has(res) ? "text-red" : null)}>
                           <div>
                              {res === "Power" ? (
                                 <div className="mi" style={{ fontSize: 26, margin: 2 }}>
                                    bolt
                                 </div>
                              ) : (
                                 <TextureComp name={`Building/${Config.ResourceToBuilding.get(res)}`} width={30} />
                              )}
                           </div>
                           <div>{Config.Resources[res].name()}</div>
                           <div className="f1" />
                           <ResourceAmount res={res} amount={amount * data.level * data.capacity} />
                           {rs.insufficient.has(res) ? <div className="mi sm inline">error</div> : null}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
         {rs.productionMultiplier.detail.length > 0 ? (
            <>
               <div className="divider my10" />
               <TitleComp>
                  <div className="f1">{t(L.ProductionMultiplier)}</div>
                  <div>x{formatNumber(rs.productionMultiplier.value)}</div>
               </TitleComp>
               <div className="divider my10" />
               <div className="mx10">
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
               </div>
            </>
         ) : null}
         {/* TODO: XP multiplier is currently not supported */}
         {/* {!(WeaponKey in def) && rs.xpMultiplier.value > 1 ? (
               <>
                  <div className="subtitle">
                     {t(L.XPMultiplier)} x{rs.xpMultiplier.value - 1}
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
            ) : null} */}
      </>
   );
}
