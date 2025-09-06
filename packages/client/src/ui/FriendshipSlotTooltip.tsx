import { getMaxFriendship } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { formatDelta } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "../utils/Global";

export function FriendshipSlotTooltip(): React.ReactNode {
   const [maxFriendship, friendshipDetail] = getMaxFriendship(G.save.state);
   return (
      <>
         <div>
            You can have <b>{maxFriendship}</b> friendship slot(s), determined as follows
         </div>
         <div className="h5" />
         <div className="flex-table mx-10">
            {friendshipDetail.map((detail) => (
               <div className="row" key={detail.name}>
                  <div className="f1">{detail.name}</div>
                  <div>{formatDelta(detail.value)}</div>
               </div>
            ))}
         </div>
      </>
   );
}
