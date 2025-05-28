import { Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type ChatLanguage, ChatLanguages } from "@spaceship-idle/shared/src/game/Languages";
import { ChatFlag, type IChat } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { classNames, hasFlag, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useEffect, useRef, useState } from "react";
import Mod from "../assets/images/Mod.png";
import { getUser, OnChatMessage, useConnected } from "../rpc/HandleMessage";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { playBling, playError } from "./Sound";
import { TextureComp } from "./components/TextureComp";

const _messages: IChat[] = [];

export function ChatPanel(): React.ReactNode {
   const connected = useConnected();
   if (!connected) {
      return (
         <div className="chat-panel">
            <div className="chat-input">
               <div className="mi">signal_disconnected</div>
               <div className="f1">{t(L.CurrentlyOffline)}</div>
               <div
                  className="mi pointer"
                  onClick={() => {
                     window.location.reload();
                  }}
               >
                  refresh
               </div>
            </div>
         </div>
      );
   }
   return (
      <>
         <ChatPanelSingle channel="en" style={{ left: 10 }} />
      </>
   );
}

export function ChatPanelSingle({
   style,
   channel,
}: { style: React.CSSProperties; channel: ChatLanguage }): React.ReactNode {
   const scrollArea = useRef<HTMLDivElement>(null);
   const isMouseOver = useRef(false);
   const handle = refreshOnTypedEvent(OnChatMessage);
   refreshOnTypedEvent(GameOptionUpdated);
   const [message, setMessage] = useState("");

   useEffect(() => {
      _messages.length = 0;
      RPCClient.getChatByChannel(channel).then((messages) => {
         OnChatMessage.emit(messages);
      });
      const dispose = OnChatMessage.on((chat) => {
         chat.forEach((c) => {
            _messages.push(c);
         });
      });
      return () => {
         dispose.dispose();
      };
   }, [channel]);

   // biome-ignore lint/correctness/useExhaustiveDependencies:
   useEffect(() => {
      if (!scrollArea.current) {
         return;
      }
      if (!isLastMessageByMe() && isMouseOver.current) {
         return;
      }
      scrollArea.current.scrollTo({
         top: scrollArea.current.scrollHeight,
         behavior: "smooth",
      });
   }, [handle]);

   const isCommand = message.startsWith("/");

   return (
      <div className="chat-panel" style={style}>
         <div
            className="chat-message-list"
            onMouseEnter={() => {
               isMouseOver.current = true;
            }}
            onMouseLeave={() => {
               isMouseOver.current = false;
            }}
            ref={scrollArea}
         >
            {_messages.map((message, index) => (
               <div className="message" key={index}>
                  <div className="name">
                     <div>{message.name}</div>
                     <TextureComp name={`Flag/${message.country}`} size={20} />
                     {hasFlag(message.flag, ChatFlag.Moderator) ? <img src={Mod} style={{ height: 15 }} /> : null}
                     <div className="f1" />
                     <div>{new Date(message.time).toLocaleTimeString()}</div>
                  </div>
                  <div className="body">{message.message}</div>
               </div>
            ))}
         </div>
         <div className={classNames("chat-input", isCommand ? "command" : null)}>
            <Menu position="bottom-start">
               <Menu.Target>
                  <div className="mi">{isCommand ? "terminal" : "apps"}</div>
               </Menu.Target>
               <Menu.Dropdown>
                  {mapOf(ChatLanguages, (language, label) => {
                     return (
                        <Menu.Item
                           key={language}
                           onClick={() => {
                              if (G.save.options.chatLanguages.size === 1) {
                                 playError();
                                 return;
                              }
                              if (G.save.options.chatLanguages.has(language)) {
                                 G.save.options.chatLanguages.delete(language);
                              } else {
                                 G.save.options.chatLanguages.add(language);
                              }
                              GameOptionUpdated.emit();
                           }}
                           leftSection={<div className="mi">check_box</div>}
                        >
                           {label}
                        </Menu.Item>
                     );
                  })}
               </Menu.Dropdown>
            </Menu>
            <input
               type="text"
               className={classNames("f1", message.startsWith("/") ? "command" : null)}
               value={message}
               onChange={(e) => {
                  setMessage(e.target.value);
               }}
               onKeyDown={(e) => {
                  if (e.key === "Enter") {
                     e.preventDefault();
                     e.stopPropagation();
                     const target = e.target as HTMLInputElement;
                     const message = target.value.trim();
                     if (message.length === 0) {
                        return;
                     }
                     setMessage("");
                     if (message.startsWith("/")) {
                        const command = message.substring(1);
                        RPCClient.sendCommand(command)
                           .then((message) => {
                              playBling();
                              notifications.show({
                                 message: <CommandOutput command={command} result={message} />,
                                 color: "blue",
                                 autoClose: false,
                                 position: "top-center",
                              });
                           })
                           .catch((e) => {
                              playError();
                              notifications.show({
                                 message: <CommandOutput command={command} result={String(e)} />,
                                 color: "red",
                                 autoClose: false,
                                 position: "top-center",
                              });
                           });
                        return;
                     }
                     RPCClient.sendChat(message, channel, G.save.options.country);
                  }
               }}
            />
         </div>
      </div>
   );
}

function CommandOutput({ command, result }: { command: string; result: string }): React.ReactNode {
   return (
      <div className="text-mono">
         <div className="row">
            <div className="mi">terminal</div>
            <div className="f1">{command}</div>
         </div>
         <div className="divider my5" />
         <div>{result}</div>
      </div>
   );
}

function isLastMessageByMe(): boolean {
   if (_messages.length === 0) {
      return false;
   }
   const lastMessage = _messages[_messages.length - 1];
   return lastMessage.name === getUser()?.handle;
}
