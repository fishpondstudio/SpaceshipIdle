import { hasModalOpen } from "../utils/ModalManager";
import { showModal } from "../utils/ToggleModal";
import { PrestigeModal } from "./PrestigeModal";

export function showPrestigeModal() {
   if (!hasModalOpen()) {
      showModal({
         children: <PrestigeModal defeated={true} />,
         size: "sm",
      });
   }
}
