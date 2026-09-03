import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only recognises t-shirt sizes (sm, lg, xl) as font
 * sizes, so our numeric scale (`text-100`) falls through to its *text-colour*
 * group and collides with `text-foreground` / `text-on-brand` — whichever came
 * last silently wins. Registering the scale keeps size and colour independent.
 *
 * Keep this list in sync with `font.size` in packages/tokens/tokens/primitives.json.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["50", "100", "200", "300", "400", "500", "600", "700", "800"] }
      ]
    }
  }
});

/**
 * Merge conditional class names and resolve Tailwind conflicts
 * (e.g. cn("p-2", condition && "p-4") -> "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
