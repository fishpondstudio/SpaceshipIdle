import type { GameState, SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { jsonDecode, jsonEncode } from "@spaceship-idle/shared/src/utils/Serialization";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import { idbDel, idbGet, idbSet } from "../utils/BrowserStorage";
import { isSteam, SteamClient } from "../utils/Steam";

const SAVE_KEY = "SpaceshipIdle";

export async function loadGame(): Promise<SaveGame> {
   const json = isSteam() ? await SteamClient.fileRead(SAVE_KEY) : await idbGet<string>(SAVE_KEY);
   if (!json) {
      throw new Error("Save not found");
   }
   return jsonDecode<SaveGame>(json);
}

export async function saveGame(save: SaveGame): Promise<void> {
   const serialized = jsonEncode(save);
   if (isSteam()) {
      await SteamClient.fileWrite(SAVE_KEY, serialized);
   } else {
      await idbSet(SAVE_KEY, serialized);
   }
}

export async function resetGame(): Promise<void> {
   if (isSteam()) {
      await SteamClient.fileDelete(SAVE_KEY);
   } else {
      await idbDel(SAVE_KEY);
   }
}

export async function saveGameStateToFile(gs: GameState): Promise<void> {
   const fileHandle = await window.showSaveFilePicker({
      suggestedName: `SS-${gs.name}-Q${resourceOf("Quantum", gs.resources).used}.ship`,
   });
   const writable = await fileHandle.createWritable();
   await writable.write(compressToUint8Array(jsonEncode(gs)));
   await writable.close();
}

export async function loadGameStateFromFile(): Promise<GameState> {
   const [fileHandle] = await window.showOpenFilePicker();
   const file = await fileHandle.getFile();
   const json = await file.arrayBuffer();
   return jsonDecode<GameState>(decompressFromUint8Array(new Uint8Array(json)));
}

export async function loadSaveGameFromFile(): Promise<SaveGame> {
   const [fileHandle] = await window.showOpenFilePicker();
   const file = await fileHandle.getFile();
   const json = await file.arrayBuffer();
   return jsonDecode<SaveGame>(decompressFromUint8Array(new Uint8Array(json)));
}
