import { Select } from "@mantine/core";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type Language, Languages } from "@spaceship-idle/shared/src/game/Languages";
import { showWarning } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G, setLanguage } from "../utils/Global";

export function ChangeLanguageComp(): React.ReactNode {
   return (
      <Select
         checkIconPosition="right"
         leftSection={<div className="mi">translate</div>}
         className="f1"
         value={G.save.options.language}
         data={mapOf(Languages as Record<Language, Record<string, string>>, (lang, content) => ({
            label: content.$Language,
            value: lang,
         }))}
         onChange={(lang) => {
            if (lang) {
               setLanguage(lang as keyof typeof Languages);
               showWarning(t(L.LanguageChangeWarning));
               GameOptionUpdated.emit();
            }
         }}
      />
   );
}
