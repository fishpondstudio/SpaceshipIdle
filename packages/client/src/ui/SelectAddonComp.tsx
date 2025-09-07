import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { type Addon, Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { mMapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { G } from "../utils/Global";
import { TextureComp } from "./components/TextureComp";

function AddonRow({ addon }: { addon: Addon }): React.ReactNode {
   return (
      <div className="row">
         <TextureComp name={`Addon/${addon}`} />
         <div className="f1">{Addons[addon].name()}</div>
      </div>
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
