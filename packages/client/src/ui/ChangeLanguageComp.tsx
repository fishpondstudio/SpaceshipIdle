import { Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { Languages } from "@spaceship-idle/shared/src/game/Languages";
import { mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G, setLanguage } from "../utils/Global";

export function ChangeLanguageComp(): React.ReactNode {
   return (
      <div className="row">
         <div className="mi">translate</div>
         <Select
            className="f1"
            value={G.save.options.language}
            data={mapOf(Languages, (lang, content) => ({ label: content.$Language, value: lang }))}
            onChange={(lang) => {
               if (lang) {
                  setLanguage(lang as keyof typeof Languages);
                  notifications.show({
                     message: t(L.LanguageChangeWarning),
                     position: "top-center",
                     color: "yellow",
                     withBorder: true,
                  });
                  GameOptionUpdated.emit();
               }
            }}
         />
      </div>
   );
}
