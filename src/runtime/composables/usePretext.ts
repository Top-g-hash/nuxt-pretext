// usePretext.ts
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

type MeasureOptions = {
  width?: number;
  font?: string;
  lineHeight?: number;
};

const cache = new Map();

export function usePretext() {
  function measure(text: string, options: MeasureOptions = {}) {
    const { width = 300, font = "16px Inter", lineHeight = 20 } = options;
    const key = JSON.stringify({ text, font, width, lineHeight });
    if (cache.has(key)) return cache.get(key);

    const prepared = prepareWithSegments(text, font);
    const result = layoutWithLines(prepared, width, lineHeight);

    cache.set(key, result);
    return result;
  }

  return { measure };
}
