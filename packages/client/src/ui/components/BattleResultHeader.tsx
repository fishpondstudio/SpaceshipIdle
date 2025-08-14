import { getGradient, useMantineTheme } from "@mantine/core";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";

export function DefeatedHeaderComp(): React.ReactNode {
   const theme = useMantineTheme();
   return (
      <div
         className="p10 mb10 col cc"
         style={{
            color: "#fff",
            borderRadius: "5px",
            background: getGradient({ deg: 180, from: "red.5", to: "red.9" }, theme),
         }}
      >
         <div className="mi" style={{ fontSize: 128 }}>
            swords
         </div>
         <div style={{ fontSize: 24 }}>{t(L.Defeated)}</div>
      </div>
   );
}

export function VictoryHeaderComp({ title }: { title: string }): React.ReactNode {
   const theme = useMantineTheme();
   return (
      <div
         className="p10 mb10 col cc"
         style={{
            color: "#fff",
            borderRadius: "5px",
            background: getGradient({ deg: 180, from: "green.5", to: "green.9" }, theme),
         }}
      >
         <div className="mi" style={{ fontSize: 128 }}>
            trophy
         </div>
         <div style={{ fontSize: 24 }}>{title}</div>
      </div>
   );
}

export function PrestigeHeaderComp(): React.ReactNode {
   const theme = useMantineTheme();
   return (
      <>
         <div
            className="p10 mb10 col cc"
            style={{
               color: "#fff",
               borderRadius: "5px",
               background: getGradient({ deg: 180, from: "space.5", to: "space.9" }, theme),
            }}
         >
            <div className="mi" style={{ fontSize: 128 }}>
               model_training
            </div>
            <div style={{ fontSize: 24 }}>{t(L.Prestige)}</div>
         </div>
      </>
   );
}
