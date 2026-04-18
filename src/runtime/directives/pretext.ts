// src/runtime/directives/pretext.ts
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

export const vPretext = {
  mounted(
    el: HTMLElement,
    binding: { value?: { font?: string; lineHeight?: number } },
  ) {
    if (import.meta.server) return;
    const width = el.offsetWidth;
    const font = binding.value?.font ?? "16px Inter";
    const lineHeight = binding.value?.lineHeight ?? 20;
    const text = el.innerText;
    const prepared = prepareWithSegments(text, font);
    const { height } = layoutWithLines(prepared, width, lineHeight);
    el.style.minHeight = `${height}px`;
  },
};
