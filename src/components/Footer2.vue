<script>

import { mask } from 'vue-the-mask'

export default {
  directives: { mask, },  
  components: { },  
  data() {
    return {
      networks: [
        //{url: 'https://www.facebook.com/CeroDesabasto', icon:'fab fa-facebook'},
        //{url: 'https://twitter.com/cerodesabasto', icon:'fab fa-twitter'},
        {url: 'https://borde.mx/incorruptible/', icon:'fa-globe'},
      ],
      institutions: ['cips','unam','nosotrxs','insp','udg','colmex','smsp'],
      is_mounted: false,
    }
  },
  computed:{
    is_sticker: (vm) => vm.$route.name == "sticker",
  },
  methods: {
    getImgUrl(n) {
      var images = require.context('~/static/', false, /\.png$/)
      return images(`./${n}_gris.png`)
    }
  },

  mounted(){
    this.$nextTick(()=>{
      this.is_mounted = true
      console.log(this.$route)
    })
  }
}
</script>

<template>
  <v-footer
    padless
    max-width="1180px"
    style="margin: 0px auto"
  >
    <v-row v-if="false">
      <v-col v-for="n in institutions"
        cols="6" sm="4" class="pa-4" :key="n" align="center">
        
        <v-img
          :src="getImgUrl(n)"
          :alt="`aliado ${n}`"
          contain
          max-height="70"
          max-width="350"
        ></v-img>
      </v-col>
      
    </v-row>
    <v-card color="white text-center" style="text-align: center; width: 100%;">
      <v-card-actions>
        
        <v-spacer></v-spacer>
        <v-img src="/logos2.png"
          height="56"
          width="1000"
          class="text-center"
        />
        <v-spacer></v-spacer>
      </v-card-actions>

      
    </v-card>
    <v-card
      flat
      tile
      class="primary--text text-center"
      style="border-top: 3px purple solid;"
    >
      <v-card-title class="subtitle-1 font-weight-bold py-1">
        BORDE
      </v-card-title>
      <v-card-text class="primary--text pt-0 pb-1 text-left">
        OBJETIVO: conocer los mecanismos de trabajo, las metodologías y procesos que implementan las SESEAs en sus procesos y proyectos, así como la relación que guardan con las organizaciones de la sociedad civil tanto locales como nacionales y sus retos en esta cruzada contra la corrupción.
      </v-card-text>
      <template v-if="!is_sticker">
        <v-divider></v-divider>
        <v-row class="primary--text mx-0" justify="space-between">
          <v-col class="mt-2" cols="5" sm="3" order="1" order-sm="1">
            <a href="https://borde.mx/" class="primary--text" target="_blank">
              {{ new Date().getFullYear() }} — <strong>Borde Político</strong>
            </a>
          </v-col>
          <v-col cols="12" sm="3" order="3" order-sm="2">
            <b>Contacto:</b> gibran@bordepolitico.com.mx
          </v-col>
          <v-col cols="7" sm="4" order="2" order-sm="3">
            <v-btn
              v-for="net in networks"
              :key="net.icon"
              align="end"
              class="mx-4 primary--text"
              icon
              large
              :href="net.url"
              target="_blank"
            >
              <v-icon size="24px" large>{{ net.icon }}</v-icon>
            </v-btn>
          </v-col>

        </v-row>
      </template>
      <v-card-actions v-else>
        <v-spacer></v-spacer>
        <v-btn color="primary" outlined href="/?s=stk">
          Más sobre el colectivo
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-footer>
</template>