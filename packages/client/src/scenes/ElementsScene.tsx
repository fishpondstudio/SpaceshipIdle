import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { getElementUpgradeCost } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import type { ElementSymbol } from "@spaceship-idle/shared/src/game/PeriodicTable";
import { AABB } from "@spaceship-idle/shared/src/utils/Vector2";
import type { ColorSource, FederatedPointerEvent } from "pixi.js";
import { G } from "../utils/Global";
import { Scene, type ISceneContext } from "../utils/SceneManager";
import { ElementCard } from "./ElementCard";

export class ElementsScene extends Scene {
   private _elementAABB: Map<ElementSymbol, { aabb: AABB; container: ElementCard }> = new Map();

   backgroundColor(): ColorSource {
      return 0x000000;
   }

   id(): string {
      return ElementsScene.name;
   }

   constructor(context: ISceneContext) {
      super(context);

      const { app, textures } = this.context;

      const width = PeriodicTableLayout[0].length * 220 + 880;
      const height = PeriodicTableLayout.length * 220 + 880;
      const minZoom = Math.min(app.screen.width / width, app.screen.height / height);

      this.viewport.setWorldSize(width, height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.center = { x: width / 2, y: height / 2 };
      this.viewport.setWorldSize(width, height);
      this.viewport.zoom = minZoom;

      this.renderTable();

      GameOptionUpdated.on(() => {
         this._elementAABB.forEach(({ aabb, container }) => {
            container.destroy({ children: true });
         });
         this._elementAABB.clear();
         this.renderTable();
      });
   }

   private renderTable() {
      PeriodicTableLayout.forEach((row, y) => {
         row.forEach((element, x) => {
            if (element) {
               const hide = !G.save.current.permanentElements.has(element) && !G.save.current.elements.has(element);
               const e = this.viewport.addChild(new ElementCard(element, 0xffffff, 0.5, hide));
               e.position.set((x + 2) * 220 + 10, (y + 2) * 220 + 10);
               const inventory = G.save.current.permanentElements.get(element);
               if (inventory && inventory.amount >= getElementUpgradeCost(inventory.level + 1)) {
                  e.toggleRedCircle(true);
               } else {
                  e.toggleRedCircle(false);
               }
               this._elementAABB.set(element, {
                  aabb: new AABB({ x: (x + 2) * 220, y: (y + 2) * 220 }, { x: (x + 3) * 220, y: (y + 3) * 220 }),
                  container: e,
               });
            }
         });
      });
   }

   override onClicked(e: FederatedPointerEvent): void {
      const position = this.viewport.screenToWorld(e.screen);
      for (const [element, { aabb, container }] of this._elementAABB) {
         container.toggleSelect(aabb.contains(position));
      }
   }
}

const PeriodicTableLayout = [
   ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
   ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
   ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
   ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
   ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
   ["Cs", "Ba", "", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
   ["Fr", "Ra", "", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"],
   [],
   ["", "", "", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu"],
   ["", "", "", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"],
] as const;
