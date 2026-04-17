import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((_nuxtApp) => {
  return {
    provide: {
      pretextDefaults: {
        font: "16px Inter",
        width: 300,
      },
    },
  };
});
