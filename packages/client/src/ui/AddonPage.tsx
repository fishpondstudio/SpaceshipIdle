import { Indicator, SegmentedControl, TextInput } from "@mantine/core";
import { AddonCraftRecipe } from "@spaceship-idle/shared/src/game/definitions/AddonCraftRecipe";
import { type Addon, Addons } from "@spaceship-idle/shared/src/game/definitions/Addons";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameOptionFlag, GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { clearFlag, cls, entriesOf, hasFlag, mapOf, reduceOf, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import React, { memo, useCallback, useState } from "react";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ToggleModal";
import { AddonModal } from "./AddonModal";
import { AddonComp } from "./components/AddonComp";
import { FloatingTip } from "./components/FloatingTip";
import { SidebarComp } from "./components/SidebarComp";
import { TextureComp } from "./components/TextureComp";
import { playClick } from "./Sound";

export function AddonPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   const [search, setSearch] = useState("");
   const isGridView = hasFlag(G.save.options.flag, GameOptionFlag.AddonGridView);
   const showAddonModal = useCallback((addon: Addon) => {
      playClick();
      showModal({
         children: <AddonModal addon={addon} />,
         size: "md",
         title: (
            <>
               <TextureComp name={`Addon/${addon}`} width={16 * 2} className="inline-middle" /> {Addons[addon].name()}
            </>
         ),
         dismiss: true,
      });
   }, []);
   return (
      <SidebarComp
         title={
            <div className="row g5">
               <TextureComp name="Others/Addon24" />
               <div className="f1">{t(L.Addons)}</div>
            </div>
         }
      >
         <div className="row m10">
            <TextInput
               leftSection={<div className="mi sm">search</div>}
               rightSection={
                  search.length > 0 ? (
                     <div className="mi sm pointer" onClick={() => setSearch("")}>
                        clear
                     </div>
                  ) : null
               }
               onKeyDown={(event) => {
                  if (event.key === "Escape") {
                     setSearch("");
                  }
               }}
               className="f1"
               value={search}
               onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <SegmentedControl
               data={[
                  { label: <div className="mi sm">list_alt</div>, value: "list" },
                  { label: <div className="mi sm">grid_view</div>, value: "grid" },
               ]}
               value={isGridView ? "grid" : "list"}
               onChange={(value) => {
                  G.save.options.flag =
                     value === "grid"
                        ? setFlag(G.save.options.flag, GameOptionFlag.AddonGridView)
                        : clearFlag(G.save.options.flag, GameOptionFlag.AddonGridView);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         {mapOf(ShipClass, (k, v, i) => {
            if (reduceOf(Addons, (prev, _, def) => prev + (def.shipClass === k ? 1 : 0), 0) === 0) {
               return null;
            }
            return (
               <React.Fragment key={k}>
                  <div className="divider my10" />
                  <div className="title">{t(L.XClass, v.name())}</div>
                  <div className="divider my10" />
                  <div className={cls(isGridView ? "addon-grid-view" : null)}>
                     {entriesOf(Addons)
                        .filter(
                           ([_, def]) =>
                              def.shipClass === k && def.name().toLowerCase().includes(search.trim().toLowerCase()),
                        )
                        .map(([addon, def]) => {
                           const amount = G.save.state.addons.get(addon)?.amount ?? 0;
                           const tile = G.save.state.addons.get(addon)?.tile;
                           if (isGridView) {
                              return (
                                 <AddonGridComp
                                    key={addon}
                                    addon={addon}
                                    amount={amount}
                                    notEquipped={amount > 0 && tile === null}
                                    onClick={showAddonModal}
                                 />
                              );
                           }
                           return (
                              <AddonListComp
                                 key={addon}
                                 addon={addon}
                                 amount={amount}
                                 notEquipped={amount > 0 && tile === null}
                                 onClick={showAddonModal}
                              />
                           );
                        })}
                  </div>
               </React.Fragment>
            );
         })}
      </SidebarComp>
   );
}

const AddonGridComp = memo(
   function _AddonGridComp({
      addon,
      amount,
      notEquipped,
      onClick,
   }: {
      addon: Addon;
      amount: number;
      notEquipped: boolean;
      onClick: (addon: Addon) => void;
   }): React.ReactNode {
      return (
         <FloatingTip key={addon} w={350} label={<AddonComp addon={addon} showDetails showCraft={false} />}>
            <Indicator
               label={amount}
               size={20}
               disabled={amount <= 0}
               offset={5}
               color={notEquipped ? "yellow" : "space"}
            >
               <div className="item" onClick={onClick.bind(null, addon)}>
                  <TextureComp name={`Addon/${addon}`} width={16 * 2} />
               </div>
            </Indicator>
         </FloatingTip>
      );
   },
   (prev, next) =>
      prev.addon === next.addon &&
      prev.amount === next.amount &&
      prev.notEquipped === next.notEquipped &&
      prev.onClick === next.onClick,
);

const AddonListComp = memo(
   function _AddonListComp({
      addon,
      amount,
      notEquipped,
      onClick,
   }: {
      addon: Addon;
      amount: number;
      notEquipped: boolean;
      onClick: (addon: Addon) => void;
   }): React.ReactNode {
      const def = Addons[addon];
      return (
         <FloatingTip key={addon} w={350} label={<AddonComp addon={addon} showDetails showCraft={false} />}>
            <div className="panel m10 pointer" onClick={onClick.bind(null, addon)}>
               <div className="row g5">
                  <TextureComp name={`Addon/${addon}`} width={16 * 2} />
                  <div>{def.name()}</div>
                  <div className="f1" />
                  {AddonCraftRecipe[addon] ? (
                     <FloatingTip label={t(L.ThisAddOnCanOnlyBeCrafted)}>
                        <div className="mi text-space">build</div>
                     </FloatingTip>
                  ) : null}
                  {notEquipped ? (
                     <FloatingTip label={t(L.ThisAddOnIsNotEquipped)}>
                        <div className="mi text-red">error</div>
                     </FloatingTip>
                  ) : null}
               </div>
               <div className="divider mx-10 my5 dashed" />
               {amount > 0 ? (
                  <div className="text-sm">
                     <AddonComp addon={addon} showDetails={false} showCraft={false} />
                  </div>
               ) : (
                  <div className="row text-sm text-dimmed">
                     <div className="f1">{AddonCraftRecipe[addon] ? t(L.NotCrafted) : t(L.NotDiscovered)}</div>
                  </div>
               )}
            </div>
         </FloatingTip>
      );
   },
   (prev, next) =>
      prev.addon === next.addon &&
      prev.amount === next.amount &&
      prev.notEquipped === next.notEquipped &&
      prev.onClick === next.onClick,
);
