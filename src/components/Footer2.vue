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
}
</script>
<template>
  <v-footer
    padless
    id="app-width"
    color="primary dark lighten-1"
  >
    <v-col cols="12" sm="8" v-if="false">
      <v-card-title class="subtitle-1 font-weight-bold py-1">
        Datos cívicos a tu alcance: Historia del presupuesto participativo
      </v-card-title>
      <v-card-text class="primary--text pt-0 pb-1 text-left">
        A través de esta página, Ollin, Jóvenes en Movimiento busca ofrecerte
        una herramienta de <b>transparencia</b>, para que conozcas los datos más
        relevantes de los proyectos ganadores de la consulta del Presupuesto
        Participativo en la Ciudad de México, a lo largo del tiempo. <br>
        Puedes consultar distintos indicadores que preparamos para que
        puedas explorar más acerca de este ejercicio ciudadano.<span v-if="false">
        puedes consultar distintos indicadores la descripción del proyecto, la variación entre el
        presupuesto aprobado y ejercido; la cantidad de votos emitidos y la
        cantidad de votos con la que ganó el proyecto triunfante en cada
        colonia, barrio, pueblo, así como la categoría de clasificación brindada
        tanto por el Instituto Electoral de la Ciudad de México, como por
        aquella elaborada por nuestra organización.</span>
      </v-card-text>
    </v-col>
    <v-col class="text-left" align="left" cols="12" sm="auto">
      <a 
        href="https://ollinac.org/"
        class="text-h5 white--text"
        target="_blank"
      >
        <strong>Ollin, A.C.</strong> — {{ new Date().getFullYear() }}
      </a>
    </v-col>
    <v-spacer v-if="$breakpoint.is.smAndUp"></v-spacer>
    <v-col class="text-right" cols="12" sm="auto">
      <v-btn
        v-for="net in networks"
        :key="net.icon"
        class="mx-4"
        dark
        icon
        large
        :href="net.url"
        target="_blank"
      >
        <v-icon size="24px" large>{{ net.icon }}</v-icon>
      </v-btn>
    </v-col>
  </v-footer>
</template>