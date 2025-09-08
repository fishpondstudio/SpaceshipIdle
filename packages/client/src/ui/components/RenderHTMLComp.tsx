import React from "react";

export function RenderHTML({
   html,
   className,
   style,
   element = "div",
}: {
   html: string;
   element?: React.HTMLElementType;
   className?: string;
   style?: React.CSSProperties;
}): React.ReactNode {
   return React.createElement(element, { className, style, dangerouslySetInnerHTML: { __html: html } });
}

export function html(
   html: string,
   className?: string,
   style?: React.CSSProperties,
   element?: React.HTMLElementType,
): React.ReactNode {
   return <RenderHTML html={html} className={className} style={style} element={element} />;
}
