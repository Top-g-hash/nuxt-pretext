import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  return {
    provide: {
      pretextDefaults: config.public.pretext,
    },
  };
});
