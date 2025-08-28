import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";

export const ToggleModal = new TypedEvent<IModalProps | null>();

export interface IModalProps {
   title?: React.ReactNode;
   children: React.ReactNode;
   dismiss?: boolean;
   size: "xs" | "sm" | "md" | "lg" | "xl";
}

export function showModal(props: IModalProps) {
   ToggleModal.emit(props);
}

export function hideModal() {
   ToggleModal.emit(null);
}
