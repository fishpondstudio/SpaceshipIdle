import { cls, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { playClick, playError } from "../Sound";

export function NumberSelect({
   value,
   canIncrease,
   canDecrease,
   onChange,
}: {
   value: number;
   canIncrease: (value: number) => boolean;
   canDecrease: (value: number) => boolean;
   onChange: (value: number) => void;
}) {
   return (
      <div className="row">
         <div
            className={cls("mi", canDecrease(value) ? null : "text-disabled")}
            onClick={() => {
               if (canDecrease(value)) {
                  playClick();
                  onChange(value - 1);
               } else {
                  playError();
               }
            }}
         >
            indeterminate_check_box
         </div>
         <div className="text-center">{formatNumber(value)}</div>
         <div
            className={cls("mi", canIncrease(value) ? null : "text-disabled")}
            onClick={() => {
               if (canIncrease(value)) {
                  playClick();
                  onChange(value + 1);
               } else {
                  playError();
               }
            }}
         >
            add_box
         </div>
      </div>
   );
}
