import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("IPCBridge", {
   rpcCall: (method: string, args: any[]) => ipcRenderer.invoke("__RPCCall", method, args),
   onClose: (callback: () => void) => {
      ipcRenderer.removeAllListeners("close");
      ipcRenderer.on("close", callback);
   },
});
