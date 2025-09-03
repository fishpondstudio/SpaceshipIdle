import React from "react";

export function RenderHTML({
   html,
   className,
   style,
   element = "div",
}: {
   element?: React.HTMLElementType;
   html: string;
   className?: string;
   style?: React.CSSProperties;
}): React.ReactNode {
   return React.createElement(element, { className, style, dangerouslySetInnerHTML: { __html: html } });
}
