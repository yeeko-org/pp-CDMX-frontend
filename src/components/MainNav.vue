<script>

export default {
  data() {
    return {
      logo: null, // require("@/assets/logo.png"),
      logo_nos: null,//require("@/assets/logo-nos.png"),
      menu: false,
      text_visible: true,
      sections: [
        {text:["Busca tu", " colonia"], icon:'fa-search-location'},
        {text:["Mapa ", "Interactivo"], icon:'fa-map-marked-alt'},
        {text:["Visualización", " de datos"], icon:'fa-chart-bar'},
      ]
    }
  },
  methods: {
    onScroll(e){
      this.text_visible = window.scrollY < 60
    }
  },
  computed:{
  },
}
</script>

<template>
  <v-app-bar 
    app 
    id="app"
    shrink-on-scroll
    prominent
    elevate-on-scroll
  >
    <v-toolbar-items 
      width="400" 
      class="mt-1" 
      :class="{'header-xs': $breakpoint.is.xs}"
    >
      <router-link to="/">
        <v-img src="/logo.png"
          :height="text_visible ? 70 : 45"
          :width="text_visible ? 194 : 128"
        />
      </router-link>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <v-toolbar-title 
      :class="{'all_width': text_visible}"
      class="pb-0"
    >
      <v-row justify="center" align="center" class="mx-0">
        <v-col 
          v-for="section in sections"
          :key="section.icon" 
          cols="4"
          class="py-0 pointer"
          v-scroll="onScroll"
          align="center"
          v-ripple
        >
          <v-row justify="center" align="center">
            <v-col class="shrink" :class="text_visible ? 'px-0' : ''">
              <v-icon 
                
                :class="text_visible ? 'mr-3' : ''" 
                :large="text_visible"
              >{{section.icon}}</v-icon>
            </v-col>
            <div v-if="text_visible" 
              class="grey--text text--darken-2">
              {{section.text[0]}}<br>
              {{section.text[1]}}
            </div>
          </v-row>          
        </v-col>
      </v-row>
    </v-toolbar-title>
    

    <v-spacer></v-spacer>
    <!--<v-app-bar-nav-icon v-else @click="menu = !menu"></v-app-bar-nav-icon>-->


    <template v-if="$breakpoint.is.smAndUp">
      <v-btn 
        text
        class="yeeko-text"
        target="_blank" 
        href="https://nosotrxs.org/medicinas-para-todxs/"
      >
        Quiénes Somos
      </v-btn>
      <!--<v-btn text class="yeeko-text">Mapeo de desabasto</v-btn>
      <v-btn class="yeeko-text" text to="/dashboard/login">
        Herramientas
      </v-btn>-->

    </template>
    <v-menu offset-y v-else>
      <template v-slot:activator="{ on }">
        <v-btn
          class="yeeko-text"
          text
          v-on="on"
          icon
        >
          <v-icon>fa-bars</v-icon>
          
        </v-btn>
      </template>
      <v-list>
        <v-list-item href="https://nosotrxs.org/medicinas-para-todxs/" target="_blank">
          <v-list-item-title class="yeeko-text">QUIÉNES SOMOS</v-list-item-title>
        </v-list-item>
        <!--<v-list-item >
          <v-list-item-title class="yeeko-text">MAPEO</v-list-item-title>
        </v-list-item>
        <v-list-item to="/dashboard/login">
          <v-list-item-title class="yeeko-text">HERRAMIENTAS</v-list-item-title>
        </v-list-item>-->
        
      </v-list>
    </v-menu>


  </v-app-bar>
</template>

<style lang="scss">
  
  .header-xs{
    margin-left: -10px
  }
  .all_width{
    min-width: 650px;
    margin-left: -12px;
    margin-right: -12px;
  }
</style>