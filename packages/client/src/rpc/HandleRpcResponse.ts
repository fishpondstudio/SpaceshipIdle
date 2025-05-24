import { RpcError } from "@spaceship-idle/shared/src/thirdparty/TRPCClient";
import { rpcRequests } from "./RPCClient";

export function handleRpcResponse(response: any) {
   if (!response || !response.id) {
      throw new Error(`Invalid RPC Response received: ${response}`);
   }
   if (!rpcRequests[response.id]) {
      throw new Error(`RPC Request ${response.id} is already handled`);
   }
   const { resolve, reject } = rpcRequests[response.id];
   delete rpcRequests[response.id];
   const { result, error } = response;
   if (error) {
      const { code, message, data } = error;
      reject(new RpcError(message, code, data));
   }
   resolve(result);
}
