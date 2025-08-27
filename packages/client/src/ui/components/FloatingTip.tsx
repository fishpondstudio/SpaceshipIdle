import { flip, getOverflowAncestors, offset, type Placement, shift, useFloating } from "@floating-ui/react";
import { type Factory, factory, getRefProp, isElement, Portal } from "@mantine/core";
import { useMergedRef } from "@mantine/hooks";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";

export function useFloatingTooltip<T extends HTMLElement = any>({ position }: { position: Placement }) {
   const [opened, setOpened] = useState(false);
   const boundaryRef = useRef<T>(null);

   const { x, y, elements, refs, update, placement } = useFloating({
      placement: position,
      middleware: [
         offset(10),
         shift(),
         flip({
            crossAxis: "alignment",
            fallbackAxisSideDirection: "end",
         }),
      ],
   });

   // biome-ignore lint/correctness/useExhaustiveDependencies: not my code
   const handleMouseMove = useCallback(
      ({ clientX, clientY }: MouseEvent | React.MouseEvent<T, MouseEvent>) => {
         refs.setPositionReference({
            getBoundingClientRect() {
               return {
                  width: 0,
                  height: 0,
                  x: clientX,
                  y: clientY,
                  left: clientX,
                  // if placement is bottom, add 20px to offset cursor size!
                  top: clientY + (placement.includes("bottom") ? 20 : 0),
                  right: clientX,
                  bottom: clientY,
               };
            },
         });
      },
      [elements.reference],
   );

   // biome-ignore lint/correctness/useExhaustiveDependencies: not my code
   useEffect(() => {
      if (refs.floating.current) {
         const boundary = boundaryRef.current!;
         boundary.addEventListener("mousemove", handleMouseMove);

         const parents = getOverflowAncestors(refs.floating.current);
         parents.forEach((parent) => {
            parent.addEventListener("scroll", update);
         });

         return () => {
            boundary.removeEventListener("mousemove", handleMouseMove);
            parents.forEach((parent) => {
               parent.removeEventListener("scroll", update);
            });
         };
      }

      return undefined;
   }, [elements.reference, refs.floating.current, update, handleMouseMove, opened]);

   return { handleMouseMove, x, y, opened, setOpened, boundaryRef, floating: refs.setFloating };
}

export const FloatingTip = factory<
   Factory<{
      props: {
         label: React.ReactNode;
         children: React.ReactNode;
         position?: Placement;
         disabled?: boolean;
         w?: string | number;
         style?: React.CSSProperties;
      };
   }>
>(({ label, children, disabled, w, style, position = "bottom" }, ref) => {
   const { handleMouseMove, x, y, opened, boundaryRef, floating, setOpened } = useFloatingTooltip({ position });

   if (!isElement(children)) {
      throw new Error(
         "FloatingTip component children should be an element or a component that accepts ref, fragments, strings, numbers and other primitive values are not supported",
      );
   }

   const targetRef = useMergedRef(boundaryRef, getRefProp(children), ref);
   const _childrenProps = children.props as any;

   const onMouseEnter = (event: React.MouseEvent<unknown, MouseEvent>) => {
      _childrenProps.onMouseEnter?.(event);
      handleMouseMove(event);
      setOpened(true);
   };

   const onMouseLeave = (event: React.MouseEvent<unknown, MouseEvent>) => {
      _childrenProps.onMouseLeave?.(event);
      setOpened(false);
   };

   return (
      <>
         <Portal>
            <div
               className="floating-tip"
               style={{
                  ...style,
                  display: !disabled && opened ? "block" : "none",
                  top: (y && Math.round(y)) ?? "",
                  left: (x && Math.round(x)) ?? "",
                  width: w,
                  maxWidth: w,
               }}
               ref={floating}
            >
               {label}
            </div>
         </Portal>

         {cloneElement(children, {
            ..._childrenProps,
            ref: targetRef,
            onMouseEnter,
            onMouseLeave,
         })}
      </>
   );
});
