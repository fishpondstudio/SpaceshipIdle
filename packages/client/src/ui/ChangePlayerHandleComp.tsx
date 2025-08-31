import { Popover, TextInput } from "@mantine/core";
import { showError, showSuccess } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { CountryCode } from "@spaceship-idle/shared/src/utils/CountryCode";
import { mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { getUser, UserUpdated } from "../rpc/HandleMessage";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { TextureComp } from "./components/TextureComp";
import { playError } from "./Sound";

export function ChangePlayerHandleComp(): React.ReactNode {
   refreshOnTypedEvent(UserUpdated);
   const user = getUser();
   const [name, setName] = useState(user?.handle ?? "");
   const [opened, setOpened] = useState(false);
   if (!user) return null;
   return (
      <>
         <div className="text-sm text-dimmed text-uppercase">{t(L.PlayerHandle)}</div>
         <div className="row">
            <TextInput
               className="f1"
               value={name}
               onChange={(e) => {
                  setName(e.target.value);
               }}
               leftSection={
                  <Popover
                     opened={opened}
                     onChange={setOpened}
                     position="bottom-start"
                     width={367}
                     styles={{ dropdown: { padding: "0", transform: "translate(-4px, 1px)" } }}
                  >
                     <Popover.Target>
                        <FloatingTip label={CountryCode[G.save.options.country]}>
                           <TextureComp
                              className="pointer"
                              onClick={() => setOpened(!opened)}
                              name={`Flag/${G.save.options.country}`}
                              width={30}
                           />
                        </FloatingTip>
                     </Popover.Target>
                     <Popover.Dropdown>
                        <div
                           className="row g5"
                           style={{ flexWrap: "wrap", height: 200, padding: "5px 0", overflowY: "auto" }}
                        >
                           {mapOf(CountryCode, (code) => {
                              return (
                                 <FloatingTip label={CountryCode[code]}>
                                    <TextureComp
                                       name={`Flag/${code}`}
                                       width={30}
                                       className="pointer"
                                       onClick={() => {
                                          G.save.options.country = code;
                                          UserUpdated.emit(user);
                                          setOpened(false);
                                       }}
                                    />
                                 </FloatingTip>
                              );
                           })}
                        </div>
                     </Popover.Dropdown>
                  </Popover>
               }
            />
            <button
               className="btn stretch"
               disabled={name === user.handle}
               onClick={async () => {
                  try {
                     await RPCClient.changePlayerHandle(name);
                     user.handle = name;
                     UserUpdated.emit(user);
                     showSuccess(t(L.OperationSuccessful));
                  } catch (e) {
                     playError();
                     showError(String(e));
                     setName(user.handle);
                  }
               }}
            >
               {t(L.ChangeHandle)}
            </button>
         </div>
         <div className="h5" />
         <div className="text-xs text-dimmed">{t(L.PlayerHandleRequirement)}</div>
      </>
   );
}
