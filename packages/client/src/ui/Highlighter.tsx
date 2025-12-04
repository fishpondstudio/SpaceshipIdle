import { getDefaultZIndex } from "@mantine/core";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useState } from "react";
import { useTypedEvent } from "../utils/Hook";

export const RequestHighlighter = new TypedEvent<string | null>();

export function Highlighter(): React.ReactNode {
   const [style, setStyle] = useState<React.CSSProperties | undefined>();
   useTypedEvent(RequestHighlighter, (data) => {
      if (data) {
         const element = document.getElementById(data);
         if (element) {
            const rect = element.getBoundingClientRect();
            setStyle({
               top: rect.top - 2,
               left: rect.left - 2,
               width: rect.width + 4,
               height: rect.height + 4,
               zIndex: getDefaultZIndex("overlay") + 1,
            });
         }
      } else {
         setStyle(undefined);
      }
   });
   if (!style) {
      return null;
   }
   return <div className="element-highlighter" style={style} />;
}
