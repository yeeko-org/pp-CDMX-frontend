<template>
  <v-app-bar app id="app-width" height="60" color="white">
    <v-toolbar-items 
      width="400" 
      class="mt-1"
      
      :class="{'header-xs': $breakpoint.is.xs}"
    >
      <router-link to="/">
        <v-img src="/logos2.png"
          height="56"
          width="1000"
        />
      </router-link>
      <v-col class="py-0 px-3 mt-3" v-if="false">
        <span class="ml-1 caption font-weight-light primary--text" >
          Impulsado por
        </span>
        <a href="https://nosotrxs.org/" target="_blank">
          <v-img 
            style="margin-top: -5px"
            src="/logo-nos.png"
            height="20"
            width="130"
          />
        </a>
      </v-col>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <!--<v-app-bar-nav-icon v-else @click="menu = !menu"></v-app-bar-nav-icon>-->


    <template v-if="$breakpoint.is.smAndUp && false">
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

<script>

export default {
  data() {
    return {
      logo: null, // require("@/assets/logo.png"),
      logo_nos: null,//require("@/assets/logo-nos.png"),
      menu: false,
    }
  },
  methods: {
  },
  computed:{ 
  },
}
</script>
<style lang="scss">

  .header-xs{
    margin-left: -10px
  }
</style>