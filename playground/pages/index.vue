<script setup>
const text = `
Nuxt Pretext allows measuring text
before rendering.

Perfect for:

• chat apps
• canvas editors
• ai UI
• dynamic cards
`;
</script>

<template>
  <div style="padding: 40px">
    <h1>nuxt-pretext demo</h1>

    <PretextText :width="260" :text="text" />
  </div>
</template>
