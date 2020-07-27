<template>
  <v-footer
    padless
    id="app-width"
    style="margin: 0px auto"
  >
    <v-card
      flat
      tile
      class="primary--text text-center"
      style="border-top: 3px purple solid;"
    >
      <v-row align="top">
        <v-col cols="8">

          <v-card-title class="subtitle-1 font-weight-bold py-1">
            Proyecto Visualizando el Presupuesto Participativo
          </v-card-title>
          <v-card-text class="primary--text pt-0 pb-1 text-left">
            Cada año, el Congreso Local de la Ciudad de México aprueba el presupuesto de la ciudad y las Alcaldías. Una parte del destinado a  las Alcaldías se llama  presupuesto participativo, el cual se aplica en proyectos propuestos por los ciudadanos de una colonia o pueblo.
          </v-card-text>
        </v-col>
        <v-col cols="4" align="start" class="text-center">
          <a 
            href="https://nosotrxs.org/"
            class="font-weight-bold text-h5 black--text"
            target="_blank"
          >
            <strong>Ollín, A.C.</strong> — {{ new Date().getFullYear() }}
          </a>
        <v-col>
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



        </v-col>
      </v-row>
    </v-card>
  </v-footer>
</template>
<script>

export default {
  data() {
    return {
      networks: [
        {'url':'https://www.facebook.com/ollinorg','icon':'fab fa-facebook'},
        {'url':'https://twitter.com/ollinorg','icon':'fab fa-twitter'},
        {'url':'http://ollinac.org/','icon':'fa-globe'},
      ],
      pages:["https://nosotrxs.org/", "https://fundar.org.mx/", "https://juntoscontraelcancer.mx/", "https://fibrosisquistica.org.mx/~h4u3f3d9/", "http://www.amlcc.org/", "https://www.dvvimss.org.mx/"]
    }
  },
  methods: {
    getImgUrl(n) {
      var images = require.context('~/static/', false, /\.png$/)
      return images(`./desabasto-${n}.png`)
    }      
  },
  created(){
    console.log("creando FOOTER")
  }
}
</script>
<style lang="scss">

</style>