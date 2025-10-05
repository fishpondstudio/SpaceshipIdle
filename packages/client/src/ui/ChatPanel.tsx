import { Menu, ScrollArea } from "@mantine/core";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { type Language, Languages, LanguagesImage } from "@spaceship-idle/shared/src/game/Languages";
import { ChatFlag, type IChat } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { cls, hasFlag, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
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
   const [isHover, setIsHover] = useState(false);
   refreshOnTypedEvent(GameOptionUpdated);

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

   const scrollToBottom = useCallback(() => {
      if (!isLastMessageByMe(messages.current) && isMouseOver.current) {
         return;
      }
      G.pixi.ticker.addOnce(() => {
         scrollArea.current?.lastElementChild?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
      });
   }, []);

   // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
   useEffect(scrollToBottom, [handle]);
   useTypedEvent(OnImageLoaded, scrollToBottom);
   const latestMessage = messages.current[messages.current.length - 1];
   const showChatMessages = isHover || isFocused || hasFlag(G.save.options.flag, GameOptionFlag.AlwaysShowChat);

   return (
      <div
         className={cls("chat-panel", isFocused ? "active" : null)}
         style={{ left }}
         onMouseEnter={() => {
            setIsHover(true);
         }}
         onMouseLeave={() => {
            setIsHover(false);
         }}
      >
         <ScrollArea
            onMouseEnter={() => {
               isMouseOver.current = true;
            }}
            onMouseLeave={() => {
               isMouseOver.current = false;
            }}
            viewportRef={scrollArea}
            classNames={{ viewport: cls("chat-message-viewport", showChatMessages ? "show" : "hide") }}
            onTransitionStart={(e) => {
               scrollToBottom();
            }}
         >
            {messages.current.map((message) => {
               return (
                  <div className="message" key={`${message.name}.${message.time}`}>
                     <div className="name">
                        <div
                           className="pointer"
                           onClick={() =>
                              SetChatInput.emit((oldChat) => {
                                 return oldChat.includes(`@${message.name}`) ? oldChat : `@${message.name} ${oldChat}`;
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
                     <ChatMessage message={message.message} />
                  </div>
               );
            })}
         </ScrollArea>
         <ChatInput
            channel={channel}
            onFocusChanged={setIsFocused}
            placeholder={!showChatMessages && latestMessage ? `${latestMessage.name}: ${latestMessage.message}` : ""}
         />
      </div>
   );
}

const ChatPanelSingle = memo(_ChatPanelSingle, (prev, next) => {
   return prev.channel === next.channel && prev.left === next.left;
});

function _ChatInput({
   placeholder,
   channel,
   onFocusChanged,
}: {
   placeholder: string;
   channel: Language;
   onFocusChanged: (focus: boolean) => void;
}): React.ReactNode {
   const [message, setMessage] = useState("");
   const isCommand = message.startsWith("/");
   const [isFocused, setIsFocused] = useState(false);
   useTypedEvent(SetChatInput, (func) => {
      setMessage(func);
   });
   return (
      <div className={cls("chat-input", isCommand ? "command" : null)}>
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
            placeholder={isFocused ? "" : placeholder}
            type="text"
            className={cls("f1", isCommand ? "command" : null)}
            value={message}
            onChange={(e) => {
               setMessage(e.target.value);
            }}
            onFocus={() => {
               setIsFocused(true);
               onFocusChanged(true);
            }}
            onBlur={() => {
               setIsFocused(false);
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
   return (
      prev.channel === next.channel &&
      prev.onFocusChanged === next.onFocusChanged &&
      prev.placeholder === next.placeholder
   );
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

const OnImageLoaded = new TypedEvent<void>();

function _ChatMessage({ message }: { message: string }): React.ReactNode {
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
            <img
               className="chat-image"
               src={message}
               onClick={() => openUrl(message)}
               onLoad={() => OnImageLoaded.emit()}
            />
         </div>
      );
   }
   return <div className={cls("body", mentionsMe ? "mentions-me" : null)}>{message}</div>;
}

const ChatMessage = memo(_ChatMessage, (prev, next) => {
   return prev.message === next.message;
});

function isLastMessageByMe(messages: IChat[]): boolean {
   if (messages.length === 0) {
      return false;
   }

   const lastMessage = messages[messages.length - 1];
   return lastMessage.name === getUser()?.handle;
}
