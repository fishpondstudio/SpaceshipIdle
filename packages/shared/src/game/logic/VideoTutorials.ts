import { L, t } from "../../utils/i18n";

export const VideoTutorial = {
   Copy: () => t(L.TutorialCopyHTML),
   Move: () => t(L.TutorialMoveHTML),
   Recycle: () => t(L.TutorialRecycleHTML),
   Multiselect: () => t(L.TutorialMultiselectHTML),
} satisfies Record<string, () => string>;

export type VideoTutorial = keyof typeof VideoTutorial;
