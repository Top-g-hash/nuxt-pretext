// src/runtime/composables/usePretextResize.ts
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { usePretext } from "./usePretext";

type ResizeOptions = {
  font?: string;
  lineHeight?: number;
};

type LayoutResult = {
  lines: { text: string; width: number }[];
  height: number;
  lineCount: number;
};

const EMPTY: LayoutResult = { lines: [], height: 0, lineCount: 0 };

export function usePretextResize(
  containerRef: Ref<HTMLElement | null>,
  text: Ref<string> | string,
  options: ResizeOptions = {},
) {
  const { measure } = usePretext();
  const result = ref<LayoutResult>(EMPTY);
  let observer: ResizeObserver | null = null;

  function recalculate(width: number) {
    if (width <= 0) return; // ← guard
    const t = typeof text === "string" ? text : text.value;
    result.value = measure(t, { width, ...options }) ?? EMPTY; // ← nullsafe
  }

  onMounted(() => {
    if (!containerRef.value) return;

    // Measure first with current width
    recalculate(containerRef.value.offsetWidth); // ← before observe

    // Then watch future resizes
    observer = new ResizeObserver(([entry]) => {
      recalculate(entry.contentRect.width);
    });
    observer.observe(containerRef.value);
  });

  onUnmounted(() => observer?.disconnect());

  return { result };
}
