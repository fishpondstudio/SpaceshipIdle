import { TypedEvent } from "../../utils/TypedEvent";

export type AlertType = "error" | "warning" | "info" | "success";
export const OnAlert = new TypedEvent<{ message: string; type: AlertType; persist: boolean; silent: boolean }>();

function showAlert(message: string, type: AlertType, persist: boolean, silent: boolean): void {
   OnAlert.emit({ message, type, persist, silent });
}

export function showInfo(message: string, persist = false, silent = false): void {
   showAlert(message, "info", persist, silent);
}

export function showSuccess(message: string, persist = false, silent = false): void {
   showAlert(message, "success", persist, silent);
}

export function showWarning(message: string, persist = false, silent = false): void {
   showAlert(message, "warning", persist, silent);
}

export function showError(message: string, persist = false, silent = false): void {
   showAlert(message, "error", persist, silent);
}
