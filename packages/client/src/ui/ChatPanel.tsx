import { Menu, ScrollArea } from "@mantine/core";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type Language, Languages, LanguagesImage } from "@spaceship-idle/shared/src/game/Languages";
import { ChatFlag, type IChat } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { classNames, hasFlag, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Mod from "../assets/images/Mod.png";
import { handleCommand } from "../game/HandleCommand";
import { getUser, OnChatMessage, useConnected } from "../rpc/HandleMessage";
import { RPCClient } from "../rpc/RPCClient";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent, useTypedEvent } from "../utils/Hook";
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
               <div className="mi pointer" onClick={() => window.location.reload()}>
                  refresh
               </div>
            </div>
         </div>
      );
   }

   if (G.save.options.chatLanguages.size === 0) {
      return (
         <div className="chat-panel off">
            <LanguageMenu icon={<div className="mi">maps_ugc</div>} />
         </div>
      );
   }

   return Array.from(G.save.options.chatLanguages).map((language, i) => (
      <ChatPanelSingle key={language} channel={language} left={10 + i * 310} />
   ));
}

const MAX_MESSAGES = 100;
const SetChatInput = new TypedEvent<(oldChat: string) => string>();

function _ChatPanelSingle({ left, channel }: { left: number; channel: Language }): React.ReactNode {
   const scrollArea = useRef<HTMLDivElement>(null);
   const isMouseOver = useRef(false);
   const handle = refreshOnTypedEvent(OnChatMessage);
   const messages = useRef<IChat[]>([]);
   const [isFocused, setIsFocused] = useState(false);

   const rowVirtualizer = useVirtualizer({
      count: messages.current.length,
      getScrollElement: () => scrollArea.current,
      estimateSize: () => 100,
      overscan: 4,
   });

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
      if (!isLastMessageByMe(messages.current) && isMouseOver.current) {
         return;
      }
      G.pixi.ticker.addOnce(() => {
         rowVirtualizer.scrollToIndex(messages.current.length - 1, { align: "end" });
      });
   }, [handle]);

   // biome-ignore lint/correctness/useExhaustiveDependencies:
   const onImageLoaded = useCallback(() => {
      G.pixi.ticker.addOnce(() => {
         rowVirtualizer.scrollToIndex(messages.current.length - 1, { align: "end" });
      });
   }, []);

   const items = rowVirtualizer.getVirtualItems();
   return (
      <div className={classNames("chat-panel", isFocused ? "active" : null)} style={{ left }}>
         <ScrollArea
            onMouseEnter={() => {
               isMouseOver.current = true;
            }}
            onMouseLeave={() => {
               isMouseOver.current = false;
            }}
            viewportRef={scrollArea}
            classNames={{ viewport: "chat-message-viewport" }}
            styles={{ content: { height: rowVirtualizer.getTotalSize(), width: "100%", position: "relative" } }}
         >
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${items[0]?.start ?? 0}px)`,
               }}
            >
               {items.map((item) => {
                  const message = messages.current[item.index];
                  return (
                     <div
                        className="message"
                        key={item.key}
                        data-index={item.index}
                        ref={rowVirtualizer.measureElement}
                     >
                        <div className="name">
                           <div
                              className="pointer"
                              onClick={() =>
                                 SetChatInput.emit((oldChat) => {
                                    return oldChat.includes(`@${message.name}`)
                                       ? oldChat
                                       : `@${message.name} ${oldChat}`;
                                 })
                              }
                           >
                              {message.name}
                           </div>
                           <TextureComp name={`Flag/${message.country}`} width={20} />
                           {hasFlag(message.flag, ChatFlag.Moderator) ? <img src={Mod} style={{ height: 15 }} /> : null}
                           <div className="f1" />
                           <div>{new Date(message.time).toLocaleTimeString()}</div>
                        </div>
                        <ChatMessage message={message.message} onImageLoaded={onImageLoaded} />
                     </div>
                  );
               })}
            </div>
         </ScrollArea>
         <ChatInput channel={channel} onFocusChanged={setIsFocused} />
      </div>
   );
}

const ChatPanelSingle = memo(_ChatPanelSingle, (prev, next) => {
   return prev.channel === next.channel && prev.left === next.left;
});

function _ChatInput({
   channel,
   onFocusChanged,
}: { channel: Language; onFocusChanged: (focus: boolean) => void }): React.ReactNode {
   const [message, setMessage] = useState("");
   const isCommand = message.startsWith("/");
   useTypedEvent(SetChatInput, (func) => {
      setMessage(func);
   });
   return (
      <div className={classNames("chat-input", isCommand ? "command" : null)}>
         <LanguageMenu
            icon={
               isCommand ? (
                  <div className="mi">terminal</div>
               ) : (
                  <TextureComp name={`Flag/${LanguagesImage[channel]}`} height={24} />
               )
            }
         />
         <input
            type="text"
            className={classNames("f1", isCommand ? "command" : null)}
            value={message}
            onChange={(e) => {
               setMessage(e.target.value);
            }}
            onFocus={() => {
               onFocusChanged(true);
            }}
            onBlur={() => {
               onFocusChanged(false);
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
   return prev.channel === next.channel && prev.onFocusChanged === next.onFocusChanged;
});

function _LanguageMenu({ icon }: { icon: React.ReactNode }): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <Menu position="bottom-start">
         <Menu.Target>{icon}</Menu.Target>
         <Menu.Dropdown>
            {mapOf(Languages as Record<Language, Record<string, string>>, (language, value) => {
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
   return prev.icon === next.icon;
});

function _ChatMessage({ message, onImageLoaded }: { message: string; onImageLoaded: () => void }): React.ReactNode {
   const isDomainWhitelisted =
      message.startsWith("https://i.imgur.com/") ||
      message.startsWith("https://i.gyazo.com/") ||
      message.startsWith("https://i.ibb.co/") ||
      message.startsWith("https://gcdnb.pbrd.co/") ||
      message.startsWith("https://i.postimg.cc/");
   const isExtensionWhitelisted = message.endsWith(".jpg") || message.endsWith(".png") || message.endsWith(".jpeg");
   const mentionsMe = message.includes(`@${getUser()?.handle}`);
   if (isDomainWhitelisted && isExtensionWhitelisted) {
      return (
         <div className="body">
            <img className="chat-image" src={message} onClick={() => openUrl(message)} onLoad={onImageLoaded} />
         </div>
      );
   }
   return <div className={classNames("body", mentionsMe ? "mentions-me" : null)}>{message}</div>;
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
