// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  imports: {
    autoImport: true,
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    define: {
      "process.env.BETTER_AUTH_URL": JSON.stringify(process.env.BETTER_AUTH_URL),
    },
  },
  typescript: {
    typeCheck: false
  },
  nitro: {
    externals: {
      external: ["@prisma/client"],
    },
  },
})
