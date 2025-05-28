import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import { type Application, type ColorSource, Container, type FederatedPointerEvent, type Texture } from "pixi.js";
import { Camera } from "./Camera";
import type { SceneLifecycle } from "./SceneLifecycle";

export abstract class Scene implements SceneLifecycle {
   public readonly viewport: Camera;
   public readonly context: ISceneContext;

   constructor(context: ISceneContext) {
      this.context = context;
      const { app } = context;
      this.viewport = new Camera(app, { scrollSensitivity: () => 1 });
   }

   abstract backgroundColor(): ColorSource;
   abstract id(): string;

   onMoved(point: IHaveXY): void {}
   onZoomed(zoom: number): void {}
   onClicked(e: FederatedPointerEvent): void {}

   protected setBackgroundColor(color: ColorSource): void {
      this.context.app.renderer.background.color = color;
   }

   onEnable(): void {
      this.context.app.renderer.background.color = this.backgroundColor();
      this.viewport.on("moved", this.onMoved, this);
      this.viewport.on("zoomed", this.onZoomed, this);
      this.viewport.on("clicked", this.onClicked, this);
      this.viewport.onEnable();
   }

   onDisable(): void {
      this.viewport.off("moved", this.onMoved, this);
      this.viewport.off("zoomed", this.onZoomed, this);
      this.viewport.off("clicked", this.onClicked, this);
      this.viewport.onDisable();
   }

   onResize(width: number, height: number): void {
      this.viewport.onResize(width, height);
   }
}

export interface ISceneContext {
   app: Application;
   textures: Map<string, Texture>;
}

export type SceneAction = (s: Scene) => void;
export const OnSceneSwitched = new TypedEvent<void>();

export class SceneManager {
   private currentScene: Scene | undefined;
   private context: ISceneContext;
   private scenes = new Map<string, Scene>();
   private queuedActions = new Map<string, SceneAction[]>();
   public readonly root: Container;
   public readonly overlay: Container;

   constructor(context: ISceneContext) {
      this.context = context;
      context.app.renderer.on("resize", (width: number, height: number) => {
         this.currentScene?.onResize(width, height);
      });
      context.app.stage.name = "Stage";
      this.root = context.app.stage.addChild(new Container());
      this.root.name = "SceneManager.Root";
      this.overlay = context.app.stage.addChild(new Container());
      this.overlay.name = "SceneManager.Overlay";
   }

   public getContext(): ISceneContext {
      return this.context;
   }

   public loadScene<T extends Scene>(SceneClass: new (context: ISceneContext) => T): T {
      if (this.isCurrent(SceneClass)) {
         return this.currentScene as T;
      }
      if (this.currentScene) {
         this.currentScene.viewport.visible = false;
         this.currentScene.onDisable();
      }

      let scene = this.scenes.get(SceneClass.name);
      if (!scene) {
         scene = new SceneClass(this.context);
         this.root.addChild(scene.viewport);
         this.scenes.set(SceneClass.name, scene);
      }

      this.currentScene = scene;
      this.currentScene.onEnable();
      this.currentScene.viewport.visible = true;

      const queuedActions = this.queuedActions.get(SceneClass.name);
      if (queuedActions) {
         for (const action of queuedActions) {
            action(scene);
         }
         queuedActions.length = 0;
      }
      OnSceneSwitched.emit();
      return this.currentScene as T;
   }

   isCurrent(SceneClass: typeof Scene): boolean {
      if (!this.currentScene) {
         return false;
      }
      // Don't use instanceof because it will break HMR
      // this.currentScene instanceof SceneClass
      return Object.getPrototypeOf(this.currentScene).constructor.name === SceneClass.name;
   }

   get currentSceneId(): string | null {
      if (!this.currentScene) return null;
      return this.currentScene.id();
   }

   getCurrent<T extends Scene>(SceneClass: new (context: ISceneContext) => T): T | null {
      if (this.isCurrent(SceneClass)) {
         return this.currentScene as T;
      }
      return null;
   }

   enqueue<T extends Scene>(SceneClass: new (context: ISceneContext) => T, action: (s: T) => void): void {
      if (this.isCurrent(SceneClass)) {
         action(this.currentScene as T);
         return;
      }
      if (this.queuedActions.has(SceneClass.name)) {
         this.queuedActions.get(SceneClass.name)?.push(action as SceneAction);
      } else {
         this.queuedActions.set(SceneClass.name, [action as SceneAction]);
      }
   }
}

export function destroyAllChildren(co: Container): void {
   const removed = co.removeChildren();
   for (let i = 0; i < removed.length; ++i) {
      removed[i].destroy({ children: true, texture: false, baseTexture: false });
   }
}
