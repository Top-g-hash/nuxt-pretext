import { defineNuxtPlugin } from "#app";
import { useRuntimeConfig } from "#app";

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig();
  return {
    provide: {
      pretextDefaults: config.public.pretext,
    },
  };
});
