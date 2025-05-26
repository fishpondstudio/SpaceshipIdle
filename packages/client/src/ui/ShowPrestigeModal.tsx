import { hasModalOpen } from "../utils/ModalManager";
import { showModal } from "../utils/ToggleModal";
import { PrestigeModal } from "./PrestigeModal";

export function showForcePrestigeModal() {
   if (!hasModalOpen()) {
      showModal({
         children: <PrestigeModal defeated={false} showClose={false} />,
         size: "sm",
      });
   }
}
