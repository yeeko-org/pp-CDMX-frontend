<script>

import { mapState, mapGetters } from "vuex";

export default {
  data() {
    return {
      logo: null, // require("@/assets/logo.png"),
      logo_nos: null,//require("@/assets/logo-nos.png"),
      menu: false,
      text_visible: true,
      active_section3: undefined,
      sections: [
        {text:["Busca tu", " colonia"], icon:'fa-search-location', name:'search'},
        {text:["Mapa ", "Interactivo"], icon:'fa-map-marked-alt', name:'map'},
        {text:["Visualización", " de datos"], icon:'fa-chart-bar', name:'viz'},
      ]
    }
  },
  computed:{
    ...mapState({
      current_section: state => state.reports.current_section,
    }),
    ...mapGetters({
      active_section: "reports/active_section",
    }),
    active_section2(){
      let cs = this.current_section
      if (cs["intro"])
        return 0
      else if (cs["search"])
        return 1
      else if (cs["map"])
        return 2
      else
        return "wacha"      
    },
  },
  methods: {
    onScroll(e){
      this.text_visible = window.scrollY < 60    
      let cs = this.current_section
      if (cs["intro"])
        this.active_section3  = 0
      else if (cs["search"])
        this.active_section3  = 1
      else if (cs["map"])
        this.active_section3  = 2
      else
        this.active_section3  = 3
    },
    goToElem(elem){
      this.$vuetify.goTo(`#${elem}`, 
        {duration: 400, offset: 40, easing:'easeInOutCubic'})
    },
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
    extension-height="10"
  >
    <v-toolbar-items 
      width="400" 
      class="mt-1" 
      :class="{'header-xs': $breakpoint.is.xs}"
    >
      <router-link to="/">
        <v-img src="/logo.png"
          :height="text_visible && $breakpoint.is.smAndUp ? 70 : 44"
          :width="text_visible && $breakpoint.is.smAndUp ? 220 : 140"
        />
      </router-link>
    </v-toolbar-items>
    <template v-slot:extension v-if="text_visible">
      <v-card class="mt-n10">
        
      </v-card>
    </template>
    <v-spacer></v-spacer>

    <v-toolbar-title 
      :class="{'all_width': text_visible && $breakpoint.is.mdAndUp, 
              'all_width_sm': text_visible && $breakpoint.is.smOnly,
              'all_width_xs': text_visible && $breakpoint.is.xsOnly}"
      class="pb-2 pb-sm-0"
    >
      <v-row justify="center" align="center" class="mx-0">
        <v-col 
          v-for="(section, idx) in sections"
          :key="section.icon" 
          cols="4"
          class="py-0 pointer px-1 px-sm-3"
          v-scroll="onScroll"
          align="center"
          v-ripple
          @click="goToElem(section.name)"
        >
          <v-row justify="center" align="center" :no-gutters="$breakpoint.is.xsOnly">
            <v-col class="shrink" :class="text_visible ? 'px-0' : ''">
              <v-icon 
                :color="idx+1 == active_section3 ? 'accent' : null"
                :class="text_visible ? 'mr-3' : ''" 
                :large="text_visible"
              >{{section.icon}}</v-icon>
            </v-col>
            <div 
              v-if="text_visible" 
              class="grey--text text--darken-2"
              :class="{'text-body-1': $breakpoint.is.xsOnly}"
            >
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
        href="https://ollinac.org/"
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
        <v-list-item href="http://ollinac.org/" target="_blank">
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
  .all_width_sm{
    min-width: 600px;
    margin-left: -200px;
    margin-right: -200px;
  }
  .all_width_xs{
    max-width: 300px;
    margin-left: -140px;
    margin-right: -50px;
    margin-bottom: -56px;
    height: 130px;    
  }
</style>