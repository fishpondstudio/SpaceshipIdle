import { LoadingOverlay } from "@mantine/core";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { useState } from "react";
import { useTypedEvent } from "../../utils/Hook";

const SetLoading = new TypedEvent<boolean>();
let _isLoading = true;

export function isLoading(): boolean {
   return _isLoading;
}

export function showLoading(): void {
   _isLoading = true;
   SetLoading.emit(_isLoading);
}

export function hideLoading(): void {
   _isLoading = false;
   SetLoading.emit(_isLoading);
}

export function LoadingComp(): React.ReactNode {
   const [visible, setVisible] = useState(_isLoading);
   useTypedEvent(SetLoading, (visible) => {
      setVisible(visible);
   });
   return (
      <LoadingOverlay
         visible={visible}
         loaderProps={{ color: "space.6", size: "xl" }}
         overlayProps={{ blur: 2, backgroundOpacity: 0.85, color: "#000" }}
      />
   );
}
