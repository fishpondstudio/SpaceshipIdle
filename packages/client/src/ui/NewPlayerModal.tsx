import { OnLanguageChanged } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { ChangePlayerHandleComp } from "./ChangePlayerHandleComp";

export function NewPlayerModal(): React.ReactNode {
   refreshOnTypedEvent(OnLanguageChanged);
   return (
      <>
         <ChangeLanguageComp />
         <div className="divider my10 mx-10" />
         <ChangePlayerHandleComp />
      </>
   );
}
