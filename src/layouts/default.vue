<script>
import MainNav from '~/components/MainNav.vue'
import Footer2 from '~/components/Footer2.vue'
export default {
  name: 'DefaultLayout',
  components: {
    MainNav,
    Footer2,
  },  
  data () {
    return {
    }
  },
}
</script>

<template>
  <v-app id="app">
    <main-nav v-if="true"></main-nav>
    <v-main>
      <v-container pa-0 fluid >
        
          <nuxt/>
        
      </v-container>
    </v-main>
    <footer2 v-if="true"/>
  </v-app>
</template>