import { Menu } from "@mantine/core";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type ChatLanguage, ChatLanguages } from "@spaceship-idle/shared/src/game/Languages";
import type { IChat } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useEffect, useRef } from "react";
import { OnChatMessage, useConnected } from "../rpc/HandleMessage";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { playError } from "./Sound";
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
      if (isMouseOver.current) {
         return;
      }
      scrollArea.current.scrollTo({
         top: scrollArea.current.scrollHeight,
         behavior: "smooth",
      });
   }, [handle]);

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
                     <div className="f1" />
                     <div>{new Date(message.time).toLocaleTimeString()}</div>
                  </div>
                  <div className="body">{message.message}</div>
               </div>
            ))}
         </div>
         <div className="chat-input">
            <Menu position="bottom-start">
               <Menu.Target>
                  <div className="mi">apps</div>
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
               className="f1"
               onKeyDown={(e) => {
                  if (e.key === "Enter") {
                     e.preventDefault();
                     e.stopPropagation();
                     const target = e.target as HTMLInputElement;
                     const message = target.value.trim();
                     if (message.length === 0) {
                        return;
                     }
                     RPCClient.sendChat(message, channel, G.save.options.country);
                     target.value = "";
                  }
               }}
            />
         </div>
      </div>
   );
}
