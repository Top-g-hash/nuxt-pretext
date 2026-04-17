<script setup lang="ts">
const props = defineProps({
  text: {
    type: String,
    required: true,
  },

  width: {
    type: Number,
    default: 300,
  },

  font: {
    type: String,
    default: "16px Inter",
  },

  tag: {
    type: String,
    default: "div",
  },
});

const { measure } = usePretext();

const layoutResult = computed(() =>
  measure(props.text, {
    width: props.width,
    font: props.font,
  }),
);
</script>

<template>
  <component :is="tag">
    <div v-for="(line, i) in layoutResult.lines" :key="i">
      {{ line.text }}
    </div>
  </component>
</template>
