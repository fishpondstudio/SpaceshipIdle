import { hasModalOpen } from "../utils/ModalManager";
import { showModal } from "../utils/ToggleModal";
import { PrestigeModal } from "./PrestigeModal";
import type { PrestigeReason } from "./PrestigeReason";

export function showPrestigeModal(reason: PrestigeReason) {
   if (!hasModalOpen()) {
      showModal({
         children: <PrestigeModal reason={reason} />,
         size: "sm",
      });
   }
}
