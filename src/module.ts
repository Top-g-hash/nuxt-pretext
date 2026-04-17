import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addComponentsDir,
  addImportsDir,
} from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "nuxt-pretext",
    configKey: "pretext",
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("./runtime/plugin"));

    addImportsDir(resolver.resolve("./runtime/composables"));

    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Pretext",
    });
  },
});
