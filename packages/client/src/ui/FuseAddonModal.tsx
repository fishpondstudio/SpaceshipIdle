import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { type Addon, Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { getFuseCost } from "@spaceship-idle/shared/src/game/logic/AddonLogic";
import { mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useState } from "react";
import { G } from "../utils/Global";
import { TextureComp } from "./components/TextureComp";

export function FuseAddonModal(): React.ReactNode {
   const [fromAddon, setFromAddon] = useState<Addon | null>(null);
   const [toAddon, setToAddon] = useState<Addon | null>(null);
   const fuseCost = fromAddon && toAddon ? getFuseCost(fromAddon, toAddon) : 0;
   return (
      <div className="m10">
         <div className="row">
            <div className="f1">
               <AddonSelect value={fromAddon} onChange={setFromAddon} />
            </div>
            <div>
               <div className="mi">arrow_forward</div>
            </div>
            <div className="f1">
               <AddonSelect value={toAddon} onChange={setToAddon} />
            </div>
         </div>
         {fuseCost === 0 ? (
            <div className="panel yellow mt10">
               You can fuse a lower class add-on into a higher (or equal) class add-on. Only discovered add-ons can be
               fused.
            </div>
         ) : null}
         {fromAddon && toAddon && fuseCost > 0 ? (
            <div className="panel mt10">
               <div className="title">Consume</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${fromAddon}`} />
                  <div>{Addons[fromAddon].name()}</div>
                  <div className="text-space">x{fuseCost}</div>
                  <div className="f1" />
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">Produce</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={`Addon/${toAddon}`} />
                  <div>{Addons[toAddon].name()}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
               </div>
               <div className="divider my10 mx-10" />
               <div className="title">Fuse Cost</div>
               <div className="h5" />
               <div className="row g5">
                  <TextureComp name={"Others/Trophy16"} />
                  <div>{t(L.VictoryPoint)}</div>
                  <div className="text-space">x1</div>
                  <div className="f1" />
               </div>
            </div>
         ) : null}
         <div className="h10" />
         <button className="btn w100 py5 filled row">
            <div className="mi">chart_data</div>
            <div>Fuse</div>
         </button>
      </div>
   );
}

function AddonRow({ addon }: { addon: Addon }): React.ReactNode {
   return (
      <div className="row">
         <TextureComp name={`Addon/${addon}`} />
         <div className="f1">{Addons[addon].name()}</div>
      </div>
   );
}

export function AddonSelect({
   value,
   onChange,
}: {
   value: Addon | null;
   onChange: (value: Addon) => void;
}): React.ReactNode {
   const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
   });

   const options = mMapOf(G.save.state.addons, (item) => (
      <Combobox.Option value={item} key={item}>
         <AddonRow addon={item} />
      </Combobox.Option>
   ));

   return (
      <Combobox
         store={combobox}
         onOptionSubmit={(val) => {
            onChange(val as Addon);
            combobox.closeDropdown();
         }}
      >
         <Combobox.Target>
            <InputBase
               component="button"
               type="button"
               pointer
               rightSection={<Combobox.Chevron />}
               onClick={() => combobox.toggleDropdown()}
               rightSectionPointerEvents="none"
            >
               {value ? <AddonRow addon={value} /> : <Input.Placeholder>{t(L.SelectAddOn)}</Input.Placeholder>}
            </InputBase>
         </Combobox.Target>
         <Combobox.Dropdown>
            <Combobox.Options>{options}</Combobox.Options>
         </Combobox.Dropdown>
      </Combobox>
   );
}
