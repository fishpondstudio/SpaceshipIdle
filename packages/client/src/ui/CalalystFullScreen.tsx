import { ScrollArea } from "@mantine/core";
import { classNames } from "@spaceship-idle/shared/src/utils/Helper";
import { useCallback, useEffect, useRef } from "react";
import styles from "./CatalystFullScreen.module.css";
import { TextureComp } from "./components/TextureComp";

export function CatalystFullScreen(): React.ReactNode {
   const viewportRef = useRef<HTMLDivElement | null>(null);

   const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
      if (!viewportRef.current || e.deltaY === 0 || e.deltaX !== 0) {
         return;
      }
      e.preventDefault();
      e.stopPropagation();

      viewportRef.current.scrollBy({
         left: e.deltaY * 2,
         behavior: "smooth",
      });
   }, []);

   useEffect(() => {
      viewportRef.current?.addEventListener("wheel", (e: WheelEvent) => {
         onWheel(e as unknown as React.WheelEvent<HTMLDivElement>);
      });
   }, [onWheel]);
   return (
      <ScrollArea
         viewportRef={viewportRef}
         classNames={{
            root: styles.container,
            content: styles.content,
         }}
         type="never"
      >
         <div style={{ flex: "0 0 320px" }}></div>
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 20,
            }}
         >
            <div className={styles.title}>Cat I</div>
            <div className={classNames(styles.box, "f1 row g0")}>
               <div
                  className="cc"
                  style={{ width: 50, borderRight: "2px dotted rgba(255, 255, 255, 0.25)", alignSelf: "stretch" }}
               >
                  <div className="mi lg">check_box_outline_blank</div>
               </div>
               <div className="f1">
                  <div className="m10">
                     <div className="text-lg">Build 3 Different Missiles</div>
                     <div className="text-sm text-dimmed">All missiles get +1 Damage Multiplier</div>
                  </div>
                  <div className="f1">
                     <ScrollArea w={400} scrollbars="x" type="auto" styles={{ content: { display: "flex" } }}>
                        <TextureComp style={{ flexShrink: 0 }} name="Building/MS1" width={75} />
                        <TextureComp style={{ flexShrink: 0 }} name="Building/MS1A" width={75} />
                        <TextureComp style={{ flexShrink: 0 }} name="Building/MS1B" width={75} />
                     </ScrollArea>
                  </div>
               </div>
            </div>
            <div className={classNames(styles.box, "f1 col")}>
               <div className="text-lg">Build 3 Different Autocannons</div>
               <div className="text-sm">All autocannons get +1 Damage Multiplier</div>
               <div className="row mt10">
                  <TextureComp name="Building/AC30" width={75} />
                  <TextureComp name="Building/AC30A" width={75} />
                  <TextureComp name="Building/AC30B" width={75} />
                  <TextureComp name="Building/AC30x3" width={75} />
               </div>
            </div>
            <div className={classNames(styles.box, "f1 col")}>
               <div className="text-lg">Building 6 Different Skiff Class Weapons</div>
               <div className="text-sm">All skiff class weapons get +2 Damage Multiplier</div>
            </div>
            <div className={classNames(styles.box, "f1 col")}>
               <div className="text-lg">Building 6 Different Skiff Class Weapons</div>
               <div className="text-sm">All skiff class weapons get +2 HP Multiplier</div>
            </div>
         </div>
         <div style={{ flex: "0 0 500px", height: "100%", background: "yellow" }}></div>
         <div style={{ flex: "0 0 500px", height: "100%", background: "purple" }}></div>
         <div style={{ flex: "0 0 500px", height: "100%", background: "orange" }}></div>
         <div style={{ flex: "0 0 500px", height: "100%", background: "pink" }}></div>
      </ScrollArea>
   );
}
