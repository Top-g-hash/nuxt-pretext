// src/runtime/composables/usePretext.ts
import { ref } from "vue";

type MeasureOptions = {
  width?: number;
  font?: string;
  lineHeight?: number;
};

const EMPTY = { lines: [] as any[], height: 0, lineCount: 0 };
const cache = new Map();

export function usePretext() {
  function measure(text: string, options: MeasureOptions = {}) {
    if (import.meta.server) return EMPTY; // ← the fix

    const { width = 300, font = "16px Inter", lineHeight = 20 } = options;
    const key = JSON.stringify({ text, font, width, lineHeight });
    if (cache.has(key)) return cache.get(key);

    // dynamic import keeps pretext out of the SSR bundle entirely
    const { prepareWithSegments, layoutWithLines } =
      await import("@chenglou/pretext"); // ← can't await in sync fn

    const prepared = prepareWithSegments(text, font);
    const result = layoutWithLines(prepared, width, lineHeight);
    cache.set(key, result);
    return result;
  }

  return { measure };
}
