<script setup lang="ts">
const props = defineProps({
  text: String,
  width: {
    type: Number,
    default: 300,
  },
  font: {
    type: String,
    default: "16px Inter",
  },
});

const { measure } = usePretext();

const layoutResult = computed(() =>
  measure(props.text!, {
    width: props.width,
    font: props.font,
  }),
);
</script>

<template>
  <div>
    <div v-for="(line, i) in layoutResult.lines" :key="i">
      {{ line.text }}
    </div>
  </div>
</template>
