import { Menu } from "@mantine/core";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type Language, Languages, LanguagesImage } from "@spaceship-idle/shared/src/game/Languages";
import { ChatFlag, type IChat } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { classNames, hasFlag, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Mod from "../assets/images/Mod.png";
import { handleCommand } from "../game/HandleCommand";
import { getUser, OnChatMessage, useConnected } from "../rpc/HandleMessage";
import { RPCClient } from "../rpc/RPCClient";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { playError } from "./Sound";
import { TextureComp } from "./components/TextureComp";

export function ChatPanel(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
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

   return Array.from(G.save.options.chatLanguages).map((language, i) => (
      <ChatPanelSingle key={language} channel={language} left={10 + i * 310} />
   ));
}

const MAX_MESSAGES = 200;

export function _ChatPanelSingle({ left, channel }: { left: number; channel: Language }): React.ReactNode {
   const scrollArea = useRef<HTMLDivElement>(null);
   const isMouseOver = useRef(false);
   const handle = refreshOnTypedEvent(OnChatMessage);
   const messages = useRef<IChat[]>([]);

   useEffect(() => {
      RPCClient.getChatByChannel(channel).then((messages) => {
         OnChatMessage.emit(messages);
      });
      const dispose = OnChatMessage.on((chat) => {
         chat.forEach((c) => {
            if (c.channel === channel) {
               messages.current.push(c);
            }
         });
         if (messages.current.length > MAX_MESSAGES) {
            messages.current.splice(0, messages.current.length - MAX_MESSAGES);
         }
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
      if (!isLastMessageByMe(messages.current) && isMouseOver.current) {
         return;
      }
      scrollArea.current.scrollTo({
         top: scrollArea.current.scrollHeight,
         behavior: "smooth",
      });
   }, [handle]);

   const onImageLoaded = useCallback(() => {
      if (!scrollArea.current) {
         return;
      }
      scrollArea.current.scrollTo({
         top: scrollArea.current.scrollHeight,
         behavior: "smooth",
      });
   }, []);

   return (
      <div className="chat-panel" style={{ left }}>
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
            {messages.current.map((message, index) => (
               <div className="message" key={index}>
                  <div className="name">
                     <div>{message.name}</div>
                     <TextureComp name={`Flag/${message.country}`} width={20} />
                     {hasFlag(message.flag, ChatFlag.Moderator) ? <img src={Mod} style={{ height: 15 }} /> : null}
                     <div className="f1" />
                     <div>{new Date(message.time).toLocaleTimeString()}</div>
                  </div>
                  <div className="body">
                     <ChatMessage message={message.message} onImageLoaded={onImageLoaded} />
                  </div>
               </div>
            ))}
         </div>
         <ChatInput channel={channel} />
      </div>
   );
}

const ChatPanelSingle = memo(_ChatPanelSingle, (prev, next) => {
   return prev.channel === next.channel && prev.left === next.left;
});

function _ChatInput({ channel }: { channel: Language }): React.ReactNode {
   const [message, setMessage] = useState("");
   const isCommand = message.startsWith("/");
   return (
      <div className={classNames("chat-input", isCommand ? "command" : null)}>
         <LanguageMenu channel={channel} isCommand={isCommand} />
         <input
            type="text"
            className={classNames("f1", isCommand ? "command" : null)}
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
                     handleCommand(message.substring(1));
                     return;
                  }
                  RPCClient.sendChat(message, channel, G.save.options.country);
               }
            }}
         />
      </div>
   );
}

const ChatInput = memo(_ChatInput, (prev, next) => {
   return prev.channel === next.channel;
});

function _LanguageMenu({ channel, isCommand }: { channel: Language; isCommand: boolean }): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <Menu position="bottom-start">
         <Menu.Target>
            {isCommand ? (
               <div className="mi">terminal</div>
            ) : (
               <TextureComp name={`Flag/${LanguagesImage[channel]}`} height={24} />
            )}
         </Menu.Target>
         <Menu.Dropdown>
            {mapOf(Languages, (language, value) => {
               return (
                  <Menu.Item
                     key={language}
                     onClick={() => {
                        const lang = G.save.options.chatLanguages;

                        if (lang.has(language)) {
                           lang.delete(language);
                        } else {
                           lang.add(language);
                        }

                        if (lang.size === 0) {
                           playError();
                           lang.add(language);
                           return;
                        }

                        GameOptionUpdated.emit();
                     }}
                     leftSection={
                        G.save.options.chatLanguages.has(language) ? (
                           <div className="mi">check_box</div>
                        ) : (
                           <div className="mi">check_box_outline_blank</div>
                        )
                     }
                  >
                     {value.$Language}
                  </Menu.Item>
               );
            })}
         </Menu.Dropdown>
      </Menu>
   );
}

const LanguageMenu = memo(_LanguageMenu, (prev, next) => {
   return prev.channel === next.channel && prev.isCommand === next.isCommand;
});

export function CommandOutput({ command, result }: { command: string; result: string }): React.ReactNode {
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

function _ChatMessage({ message, onImageLoaded }: { message: string; onImageLoaded: () => void }): React.ReactNode {
   const isDomainWhitelisted =
      message.startsWith("https://i.imgur.com/") ||
      message.startsWith("https://i.gyazo.com/") ||
      message.startsWith("https://i.ibb.co/") ||
      message.startsWith("https://gcdnb.pbrd.co/") ||
      message.startsWith("https://i.postimg.cc/");
   const isExtensionWhitelisted = message.endsWith(".jpg") || message.endsWith(".png") || message.endsWith(".jpeg");
   if (isDomainWhitelisted && isExtensionWhitelisted) {
      return <img className="chat-image" src={message} onClick={() => openUrl(message)} onLoad={onImageLoaded} />;
   }
   return message;
}

const ChatMessage = memo(_ChatMessage, (prev, next) => {
   return prev.message === next.message && prev.onImageLoaded === next.onImageLoaded;
});

function isLastMessageByMe(messages: IChat[]): boolean {
   if (messages.length === 0) {
      return false;
   }
   const lastMessage = messages[messages.length - 1];
   return lastMessage.name === getUser()?.handle;
}
