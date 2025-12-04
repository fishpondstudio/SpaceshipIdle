import { createTheme, MantineProvider, Portal, Tooltip } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import { createRoot } from "react-dom/client";
import { bootstrap } from "./Bootstrap";
import "./css/main.css";
import { BottomPanel } from "./ui/BottomPanel";
import { ChatPanel } from "./ui/ChatPanel";
import { LoadingComp } from "./ui/components/LoadingComp";
import { FullScreen } from "./ui/FullScreen";
import { Popover } from "./ui/Popover";
import { Sidebar } from "./ui/Sidebar";
import { TopPanel } from "./ui/TopPanel";
import { G } from "./utils/Global";
import { ModalManager } from "./utils/ModalManager";
import { Highlighter } from "./ui/Highlighter";

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
   fontFamilyMonospace: "SpaceshipIdleMono, monospace",
   lineHeights: {
      xs: "1.1",
      sm: "1.25",
      md: "1.5",
      lg: "1.75",
      xl: "2",
   },
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
      Tooltip: Tooltip.extend({
         defaultProps: {
            color: "gray",
            maw: "350px",
            multiline: true,
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
      <Highlighter />
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
document.body.appendChild(app.view as HTMLCanvasElement);
bootstrap();
