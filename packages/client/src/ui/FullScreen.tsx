import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useState } from "react";
import { useTypedEvent } from "../utils/Hook";

export const UpdateFullScreen = new TypedEvent<React.ReactNode>();

export function setFullScreen(content: React.ReactNode) {
   UpdateFullScreen.emit(content);
}

export function FullScreen(): React.ReactNode {
   const [fullScreen, setFullScreen] = useState<React.ReactNode>();
   useTypedEvent(UpdateFullScreen, setFullScreen);
   return fullScreen;
}
