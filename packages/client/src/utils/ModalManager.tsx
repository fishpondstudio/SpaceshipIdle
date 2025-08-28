import { CloseButton, Overlay, ScrollArea, Transition } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { cls } from "@spaceship-idle/shared/src/utils/Helper";
import { useState } from "react";
import { useTypedEvent } from "./Hook";
import { type IModalProps, ToggleModal } from "./ToggleModal";

let _hasModalOpen = false;

export function hasModalOpen(): boolean {
   return _hasModalOpen;
}

export function ModalManager(): React.ReactNode {
   const [currentModalProps, setCurrentModalProps] = useState<IModalProps | null>();
   const [opened, { close, open }] = useDisclosure(_hasModalOpen, {
      onClose: () => {
         _hasModalOpen = false;
      },
      onOpen: () => {
         _hasModalOpen = true;
      },
   });

   useTypedEvent(ToggleModal, (props) => {
      if (props) {
         setCurrentModalProps(props);
         open();
      } else {
         close();
      }
   });

   return (
      <Transition
         mounted={opened}
         transition="fade"
         onExited={() => {
            setCurrentModalProps(null);
         }}
      >
         {(styles) => (
            <Overlay
               onMouseDown={(e) => {
                  if (e.target === e.currentTarget && currentModalProps?.dismiss) {
                     close();
                  }
               }}
               style={styles}
            >
               <div className={cls("sf-frame modal", currentModalProps?.size ?? "md")}>
                  {currentModalProps?.title ? (
                     <>
                        <div className="row m10">
                           <div className="f1">{currentModalProps?.title}</div>
                           {currentModalProps?.dismiss ? <CloseButton onClick={() => close()} /> : null}
                        </div>
                        <div className="divider" />
                     </>
                  ) : null}
                  <ScrollArea.Autosize scrollbars="y" type="hover" className="modal-content">
                     {currentModalProps?.children}
                  </ScrollArea.Autosize>
               </div>
            </Overlay>
         )}
      </Transition>
   );
}
