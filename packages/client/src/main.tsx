import { createTheme, MantineProvider, Portal } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import { createRoot } from "react-dom/client";
import { bootstrap } from "./Bootstrap.ts";
import "./css/main.css";
import { BottomPanel } from "./ui/BottomPanel.tsx";
import { ChatPanel } from "./ui/ChatPanel.tsx";
import { LoadingComp } from "./ui/components/LoadingComp.tsx";
import { FullScreen } from "./ui/FullScreen.tsx";
import { Popover } from "./ui/Popover.tsx";
import { Sidebar } from "./ui/Sidebar.tsx";
import { TopPanel } from "./ui/TopPanel.tsx";
import { G } from "./utils/Global.tsx";
import { ModalManager } from "./utils/ModalManager.tsx";

const spaceColors = [
   "#f0f4fa",
   "#dfe4ed",
   "#bbc7dc",
   "#94a9cd",
   "#748fbf",
   "#5f7eb7",
   "#5476b5",
   "#45659f",
   "#3b598f",
   "#2e4d7f",
] as const;

const theme = createTheme({
   fontFamily: "SpaceshipIdle, sans-serif",
   primaryColor: "space",
   colors: {
      space: spaceColors,
      dark: [
         "#c1c8d7",
         "#a2acc3",
         "#8391af",
         "#505e7c",
         "#3c465d",
         "#343d51",
         "#282f3e",
         "#202531",
         "#181c25",
         "#101319",
      ],
   },
   components: {
      Portal: Portal.extend({
         defaultProps: {
            reuseTargetNode: true,
         },
      }),
   },
});

if (import.meta.env.DEV) {
   document.body.classList.add("dev");
}

const root = document.getElementById("root")!;
createRoot(root).render(
   <MantineProvider defaultColorScheme="dark" theme={theme}>
      <FullScreen />
      <Notifications />
      <Sidebar />
      <TopPanel />
      <BottomPanel />
      <ChatPanel />
      <Popover />
      <ModalManager />
      <LoadingComp />
   </MantineProvider>,
);

const app = new Application({
   resizeTo: document.body,
   autoDensity: true,
   resolution: window.devicePixelRatio,
   sharedTicker: true,
   background: 0x000000,
   backgroundAlpha: 1,
});
app.ticker.maxFPS = 60;

if (import.meta.env.DEV) {
   initDevtools({ app });
}

G.pixi = app;
document.body.appendChild(app.view as any);
bootstrap();
