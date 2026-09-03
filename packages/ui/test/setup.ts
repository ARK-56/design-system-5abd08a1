import "@testing-library/jest-dom/vitest";

// This setup file runs for every suite, including the ones that assert against
// build output with `@vitest-environment node`. Bail out when there is no DOM.
if (typeof window !== "undefined") {
  // Radix primitives reach for browser APIs jsdom does not implement.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false
    })) as typeof window.matchMedia;
  }

  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}
