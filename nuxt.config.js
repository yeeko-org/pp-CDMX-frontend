import colors from 'vuetify/es5/util/colors'

export default {
  mode: 'universal',
  srcDir: 'src/',
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: 'Presupuesto Participativo CDMX',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Conoce más sobre el Presupuesto Participativo de la CDMX' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: 'red' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/breakpoints',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    //'@nuxtjs/google-analytics',
    '@nuxtjs/vuetify'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID
  }*/
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: process.env.NODE_ENV == 'development' 
    ? 'http://localhost:8000/api'
    : 'https://ppcdmx.yeeko.org/api',
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      themes: {
        light: {
          primary: colors.indigo.darken3, // #E53935
          accent: colors.orange.accent4, // #3F51B5
          secondary: colors.amber.accent3, // #3F51B5
        },
      },
    },
    defaultAssets: {
      icons: 'fa'
    },
    icons: {
      iconfont: 'fa',
    },
    treeShake: process.env.NODE_ENV == 'development' ? false : true,
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
