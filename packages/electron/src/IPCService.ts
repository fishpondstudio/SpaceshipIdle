import { app, shell } from "electron";
import { exists, outputFile, readFile, unlink } from "fs-extra";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import path from "node:path";
import { getGameSavePath, getLocalGameSavePath, type SteamClient } from ".";

export class IPCService {
   private _client: SteamClient;

   constructor(steam: SteamClient) {
      this._client = steam;
   }

   public async fileWrite(name: string, content: string): Promise<void> {
      await outputFile(path.join(getGameSavePath(), this.getSteamId(), name), compressToUint8Array(content));
   }

   public async fileWriteBytes(name: string, content: Uint8Array): Promise<void> {
      if (content.byteLength <= 0) return;
      await outputFile(path.join(getGameSavePath(), this.getSteamId(), name), Buffer.from(content));
   }

   public async fileRead(name: string): Promise<string | undefined> {
      try {
         const content = await readFile(path.join(getGameSavePath(), this.getSteamId(), name));
         return decompressFromUint8Array(content);
      } catch (error) {
         return undefined;
      }
   }

   public async fileReadBytes(name: string): Promise<ArrayBuffer> {
      const content = await readFile(path.join(getGameSavePath(), this.getSteamId(), name));
      return content.buffer;
   }

   public async fileDelete(name: string): Promise<void> {
      const filePath = path.join(getGameSavePath(), this.getSteamId(), name);
      if (await exists(filePath)) {
         unlink(filePath);
      }
   }

   public openUrl(url: string): void {
      shell.openExternal(url);
   }

   public getSteamId(): string {
      return this._client.localplayer.getSteamId().steamId64.toString();
   }

   public async getAuthSessionTicket(): Promise<string> {
      return (await this._client.auth.getAuthTicketForWebApi("")).getBytes().toString("hex");
   }

   public getAppId(): number {
      return this._client.utils.getAppId();
   }

   public getBetaName(): string {
      return this._client.apps.currentBetaName() ?? "";
   }

   public openMainSaveFolder(): void {
      shell.openPath(path.join(getGameSavePath(), this.getSteamId()));
   }

   public openBackupSaveFolder(): void {
      shell.openPath(path.join(getLocalGameSavePath(), this.getSteamId()));
   }

   public openLogFolder(): void {
      shell.openPath(getLocalGameSavePath());
   }

   public unlockAchievement(key: string): boolean {
      return this._client.achievement.activate(key);
   }

   public quit(): void {
      app.exit(0);
   }
}
