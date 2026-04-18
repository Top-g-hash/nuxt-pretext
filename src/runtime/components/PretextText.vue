<!-- src/runtime/components/PretextText.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { usePretext } from "../composables/usePretext";

const props = defineProps({
  text: { type: String, required: true },
  width: { type: Number, default: 300 },
  font: { type: String, default: "16px Inter" },
  lineHeight: { type: Number, default: 20 },
  tag: { type: String, default: "div" },
});

const { measure } = usePretext();

const layoutResult = computed(() =>
  measure(props.text, {
    width: props.width,
    font: props.font,
    lineHeight: props.lineHeight,
  }),
);

// SSR: reserve height so no layout jump on hydration
const placeholderStyle = computed(() =>
  layoutResult.value.height
    ? {}
    : { minHeight: `${props.lineHeight}px`, visibility: "hidden" },
);
</script>

<template>
  <component :is="tag" :style="placeholderStyle">
    <div
      v-for="(line, i) in layoutResult.lines"
      :key="i"
      :style="{ lineHeight: lineHeight + 'px' }"
    >
      {{ line.text }}
    </div>
  </component>
</template>
