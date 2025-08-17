import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";

export function TopLeftPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return <div className="top-left-panel text-xs text-mono">Modules: {G.save.state.tiles.size}</div>;
}
