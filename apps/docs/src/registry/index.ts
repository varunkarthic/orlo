import type { Doc } from "./types.ts";
import { actions } from "./actions.tsx";
import { forms } from "./forms.tsx";
import { pickers } from "./pickers.tsx";
import { navigation } from "./navigation.tsx";
import { overlays } from "./overlays.tsx";
import { structure } from "./structure.tsx";
import { data } from "./data.tsx";
import { feedback } from "./feedback.tsx";
import { media } from "./media.tsx";
import { specialty } from "./specialty.tsx";

export const docs: Record<string, Doc> = { ...actions, ...forms, ...pickers, ...navigation, ...overlays, ...structure, ...data, ...feedback, ...media, ...specialty };
export type { Doc };
