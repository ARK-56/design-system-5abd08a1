import * as React from "react";

/**
 * Maps semantic token names (without the `--`) to override values, e.g.
 * { "color-brand-default": "#0f766e", "color-brand-hover": "#0d5f5a" }
 *
 * This is the *runtime* re-theming lever, for previewing a client's brand or
 * running several brands in one app. The primary lever for a real client
 * project is still swapping packages/tokens/tokens/primitives.json and
 * rebuilding - this prop is for cases that can't wait for a rebuild.
 */
export type ThemeOverrides = Record<string, string>;

export interface ThemeProviderProps {
  /** CSS variable overrides, applied to this subtree only. */
  theme?: ThemeOverrides;
  /** Element type to render as the theme scope. Defaults to "div". */
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

/**
 * Scopes a set of CSS custom property overrides to its children. Wrap your
 * app once with no `theme` prop to use the default tokens, or wrap a section
 * with a `theme` override to preview/run a different client brand inline.
 */
export const ThemeProvider = React.forwardRef<HTMLElement, ThemeProviderProps>(function ThemeProvider(
  { theme, as: Component = "div", className, children },
  ref
) {
  const style = React.useMemo(() => {
    if (!theme) return undefined;
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(theme)) {
      vars[`--${key}`] = value;
    }
    return vars as React.CSSProperties;
  }, [theme]);

  return (
    <Component ref={ref} className={className} style={style}>
      {children}
    </Component>
  );
});
