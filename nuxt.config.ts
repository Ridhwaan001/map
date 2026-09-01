// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-security", "@nuxtjs/leaflet"],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  security: {
    headers: {
      referrerPolicy: "origin",
      contentSecurityPolicy: false,
    },
  },

  compatibilityDate: "2026-06-30",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
