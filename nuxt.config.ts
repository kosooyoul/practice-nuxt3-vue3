import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({

  publicRuntimeConfig: {
    // axios: {
    //   baseURL: 'https://api.nuxtjs.dev',
    // },
  },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs-alt/axios'],
})
