import { CloseButton, Tooltip } from "@mantine/core";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { VideoTutorial } from "@spaceship-idle/shared/src/game/logic/VideoTutorials";
import { classNames } from "@spaceship-idle/shared/src/utils/Helper";
import type React from "react";
import { TutorialVideos } from "../../game/Tutorial";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import { RenderHTML } from "./RenderHTMLComp";

export function VideoTutorialComp({
   tutorial,
   className,
   style,
}: { tutorial: VideoTutorial; className?: string; style?: React.CSSProperties }): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   if (G.save.options.videoTutorials.has(tutorial)) {
      return null;
   }
   const desc = VideoTutorial[tutorial];
   const video = TutorialVideos[tutorial];
   return (
      <Tooltip
         styles={{
            tooltip: {
               padding: 0,
               overflow: "hidden",
               border: "2px solid var(--mantine-color-dark-3)",
            },
         }}
         multiline
         position="left"
         label={<video src={video} autoPlay loop muted style={{ height: "50vh", display: "block" }} />}
      >
         <div className={classNames("video-tutorial", className)} style={style}>
            <video src={video} autoPlay loop muted />
            <RenderHTML html={desc()} />
            <CloseButton
               size="sm"
               onClick={() => {
                  G.save.options.videoTutorials.add(tutorial);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
      </Tooltip>
   );
}
