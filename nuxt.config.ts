import glsl from 'vite-plugin-glsl'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  env: {},
  head: {},
  publicRuntimeConfig: {
    // axios: {
    //   baseURL: 'https://api.nuxtjs.dev',
    // },
  },
  modules: ['@nuxtjs-alt/axios'],
  build: {
    transpile: ['three', 'gsap'],
  },
  vite: {
    plugins: [glsl()],
  },
})
