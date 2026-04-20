// src/runtime/composables/usePretext.ts
import { EMPTY_RESULT } from "../utils/empty";

type MeasureOptions = { width?: number; font?: string; lineHeight?: number };
export const EMPTY_RESULT = {
  lines: [] as { text: string; width: number }[],
  height: 0,
  lineCount: 0,
};

const cache = new Map();

export function usePretext() {
  function measure(text: string, options: MeasureOptions = {}) {
    if (import.meta.server) return EMPTY_RESULT; // ← guard #1

    const { width = 300, font = "16px Inter", lineHeight = 20 } = options;

    if (!width || width <= 0) return EMPTY_RESULT; // ← guard #2

    const key = JSON.stringify({ text, font, width, lineHeight });
    if (cache.has(key)) return cache.get(key);

    try {
      // pretext is client-only, this import is fine — we're past the server guard
      const {
        prepareWithSegments,
        layoutWithLines,
      } = require("@chenglou/pretext");
      const prepared = prepareWithSegments(text, font);
      const result = layoutWithLines(prepared, width, lineHeight);
      cache.set(key, result);
      return result;
    } catch {
      return EMPTY_RESULT; // ← guard #3: font not loaded yet, etc.
    }
  }

  return { measure };
}
