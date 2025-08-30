import { type Resource, Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { getAvailableQuantum, resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { cls, formatDelta, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../../utils/Global";
import { TextureComp } from "./TextureComp";

export function ResourceListComp({
   res,
   quantum = 0,
}: {
   res: Partial<Record<Resource, number>>;
   quantum?: number;
}): React.ReactNode {
   return (
      <>
         {quantum === 0 ? null : (
            <ResourceRequirementComp
               name={t(L.Quantum)}
               required={quantum}
               current={getAvailableQuantum(G.save.state)}
               texture="Others/Quantum"
            />
         )}
         {mapOf(res, (res, amount) => {
            const def = Resources[res];
            return (
               <ResourceRequirementComp
                  key={res}
                  name={def.name()}
                  required={amount}
                  current={resourceOf(res, G.save.state.resources).current}
                  texture={def.texture}
               />
            );
         })}
      </>
   );
}

export function ResourceRequirementComp({
   name,
   required,
   current,
   texture,
   desc,
}: {
   name: React.ReactNode;
   required: number;
   current: number;
   texture?: string;
   desc?: React.ReactNode;
}): React.ReactNode {
   const hasEnough = current >= Math.abs(required);
   return (
      <div className="row g5 fstart">
         <div className="f1">
            <div>{name}</div>
            {desc ? <div className="text-xs text-space">{desc}</div> : null}
         </div>
         <div className={cls(hasEnough ? "text-green" : "text-red")}>{formatDelta(required)}</div>
         {texture ? <TextureComp name={texture} /> : null}
         {hasEnough ? (
            <div className="mi xs text-green" style={{ fontSize: 16 }}>
               check_circle
            </div>
         ) : (
            <div className="mi xs text-red" style={{ fontSize: 16 }}>
               cancel
            </div>
         )}
      </div>
   );
}
