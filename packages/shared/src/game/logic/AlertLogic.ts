import { TypedEvent } from "../../utils/TypedEvent";

export type AlertType = "error" | "warning" | "info" | "success";
export const OnAlert = new TypedEvent<{ message: string; type: AlertType; persist: boolean }>();

function showAlert(message: string, type: AlertType, persist: boolean): void {
   OnAlert.emit({ message, type, persist });
}

export function showInfo(message: string, persist = false): void {
   showAlert(message, "info", persist);
}

export function showSuccess(message: string, persist = false): void {
   showAlert(message, "success", persist);
}

export function showWarning(message: string, persist = false): void {
   showAlert(message, "warning", persist);
}

export function showError(message: string, persist = false): void {
   showAlert(message, "error", persist);
}
