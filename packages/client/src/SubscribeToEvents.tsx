import { getDefaultZIndex, type MantineColor } from "@mantine/core";
import { clamp } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { AddonElementId } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { Resources } from "@spaceship-idle/shared/src/game/definitions/Resource";
import { OnAlert, showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { RequestParticle } from "@spaceship-idle/shared/src/game/logic/RequestParticle";
import { addStat, calcSpaceshipXP } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { OnBattleStatusChanged } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { getDOMRectCenter } from "@spaceship-idle/shared/src/utils/Helper";
import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import type React from "react";
import { saveGame } from "./game/LoadSave";
import { onSteamClose } from "./rpc/SteamClient";
import { getTextureSpriteStyle } from "./ui/components/TextureComp";
import { PeaceTreatyModal } from "./ui/PeaceTreatyModal";
import { runFunc, sequence } from "./utils/actions/Actions";
import { CustomAction } from "./utils/actions/CustomAction";
import { Easing } from "./utils/actions/Easing";
import { G } from "./utils/Global";
import { SteamClient } from "./utils/Steam";
import { showModal } from "./utils/ToggleModal";

export function subscribeToEvents(): void {
   OnBattleStatusChanged.on(({ status, prevStatus }) => {
      if (prevStatus === BattleStatus.InProgress && status !== BattleStatus.InProgress) {
         let modal: React.ReactNode = null;
         switch (G.runtime.battleType) {
            case BattleType.Battle: {
               const stat = G.runtime.leftStat;
               modal = (
                  <PeaceTreatyModal
                     battleScore={Math.round((100 * stat.currentHp) / stat.maxHp)}
                     name={G.runtime.right.name}
                     enemyXP={calcSpaceshipXP(G.runtime.original.right)}
                     battleInfo={G.runtime.battleInfo}
                  />
               );
               if (G.runtime.battleStatus === BattleStatus.RightWin) {
                  addStat("Defeat", 1, G.save.state.stats);
                  G.save.state.stats.set("WinningStreak", 0);
               } else {
                  addStat("Victory", 1, G.save.state.stats);
                  addStat("WinningStreak", 1, G.save.state.stats);
               }
               break;
            }
         }

         G.speed = 0;
         saveGame(G.save);
         showModal({
            children: modal,
            size: "lg",
            dismiss: false,
         });
      }
   });

   OnAlert.on(({ message, type, persist, silent }) => {
      if (!silent) {
         let color: MantineColor;
         switch (type) {
            case "info":
               color = "blue";
               break;
            case "success":
               color = "green";
               break;
            case "warning":
               color = "yellow";
               break;
            case "error":
               color = "red";
               break;
            default:
               color = "blue";
               break;
         }

         notifications.show({
            message,
            position: "top-center",
            color,
            withBorder: true,
         });
      }
      if (persist) {
         G.save.data.alerts.unshift({ message, type, time: Date.now(), tick: G.save.data.tick });
         while (G.save.data.alerts.length > 100) {
            G.save.data.alerts.pop();
         }
      }
   });

   onSteamClose(async () => {
      await saveGame(G.save);
      SteamClient.quit();
   });

   window.addEventListener("error", (event) => {
      showError(String(event.message));
   });

   window.addEventListener("unhandledrejection", (event) => {
      showError(String(event.reason));
   });

   RequestParticle.on((data) => {
      if ("resource" in data) {
         const target = document.getElementById(Resources[data.resource].domId)?.getBoundingClientRect();
         if (!target) {
            return;
         }
         playParticle(
            Resources[data.resource].texture24,
            data.from,
            getDOMRectCenter(target),
            clamp(data.amount, 1, MaxParticleCount),
         );
      } else if ("addon" in data) {
         const target = document.getElementById(AddonElementId)?.getBoundingClientRect();
         if (!target) {
            return;
         }
         playParticle(
            `Addon/${data.addon}`,
            data.from,
            getDOMRectCenter(target),
            clamp(data.amount, 1, MaxParticleCount),
         );
      }
   });
}

const MaxParticleCount = 5;

function playParticle(texture: string, from: IHaveXY, target: IHaveXY, count: number): void {
   for (let i = 0; i < count; i++) {
      const particle = document.body.appendChild(document.createElement("div"));
      const style = getTextureSpriteStyle(texture);

      if (style) {
         particle.style.backgroundImage = String(style.backgroundImage);
         particle.style.width = `${style.width}px`;
         particle.style.height = `${style.height}px`;
         particle.style.backgroundPosition = String(style.backgroundPosition);
         particle.style.backgroundSize = String(style.backgroundSize);
         particle.style.imageRendering = String(style.imageRendering);
      }

      const rect = particle.getBoundingClientRect();

      particle.style.zIndex = String(getDefaultZIndex("modal") + 2);
      particle.style.position = "fixed";
      particle.style.top = `${from.y - rect.height / 2}px`;
      particle.style.left = `${from.x - rect.width / 2}px`;
      particle.style.pointerEvents = "none";

      sequence(
         new CustomAction(
            () => {
               const rect = particle.getBoundingClientRect();
               return { x: rect.x, y: rect.y };
            },
            ({ x, y }) => {
               particle.style.left = `${x}px`;
               particle.style.top = `${y}px`;
            },
            (initial, target, factor) => {
               return {
                  x: initial.x + (target.x - initial.x) * factor,
                  y: initial.y + (target.y - initial.y) * factor,
               };
            },
            {
               x: from.x + (Math.random() - 0.5) * 100 - rect.width / 2,
               y: from.y + (Math.random() - 0.5) * 100 - rect.height / 2,
            },
            0.5 + 0.1 * i,
            Easing.OutQuad,
         ),
         new CustomAction(
            () => {
               const rect = particle.getBoundingClientRect();
               return { x: rect.x, y: rect.y };
            },
            ({ x, y }) => {
               particle.style.left = `${x}px`;
               particle.style.top = `${y}px`;
            },
            (initial, target, factor) => {
               return {
                  x: initial.x + (target.x - initial.x) * factor,
                  y: initial.y + (target.y - initial.y) * factor,
               };
            },
            {
               x: target.x - rect.width / 2,
               y: target.y - rect.height / 2,
            },
            1 * (1 + Math.random() * 0.25),
            Easing.InOutQuad,
         ),
         new CustomAction(
            () => {
               return { opacity: particle.style.opacity ? Number.parseFloat(particle.style.opacity) : 1 };
            },
            ({ opacity }) => {
               particle.style.opacity = `${opacity}`;
            },
            (initial, target, factor) => {
               return {
                  opacity: initial.opacity + (target.opacity - initial.opacity) * factor,
               };
            },
            {
               opacity: 0,
            },
            0.1 + Math.random() * 0.15,
            Easing.Linear,
         ),
         runFunc(() => {
            particle.remove();
         }),
      ).start();
   }
}
