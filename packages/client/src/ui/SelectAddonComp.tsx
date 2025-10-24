import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { type Addon, Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass, ShipClassList } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../utils/Global";
import { AddonComp } from "./components/AddonComp";
import { FloatingTip } from "./components/FloatingTip";
import { TextureComp } from "./components/TextureComp";

function AddonRow({ addon }: { addon: Addon }): React.ReactNode {
   return (
      <FloatingTip label={<AddonComp addon={addon} showDetails showCraft={false} />}>
         <div className="row g5">
            <TextureComp name={`Addon/${addon}`} />
            <div>{Addons[addon].name()}</div>
            <div className="text-dimmed">({G.save.state.addons.get(addon)?.amount ?? 0})</div>
            <div className="f1" />
            <div className="text-dimmed text-xs text-uppercase">{ShipClass[Addons[addon].shipClass].name()}</div>
         </div>
      </FloatingTip>
   );
}

export function SelectAddonComp({
   value,
   onChange,
}: {
   value: Addon | null;
   onChange: (value: Addon) => void;
}): React.ReactNode {
   const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
   });

   const options = Array.from(G.save.state.addons)
      .sort(([a], [b]) => {
         return ShipClassList.indexOf(Addons[a].shipClass) - ShipClassList.indexOf(Addons[b].shipClass);
      })
      .map(([item]) => (
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
            <Combobox.Options>
               {options}
               {options.length === 0 ? (
                  <div className="row p10">
                     <div className="mi">info</div>
                     {t(L.NoAvailableAddons)}
                  </div>
               ) : null}
            </Combobox.Options>
         </Combobox.Dropdown>
      </Combobox>
   );
}
