<script>
import MainNav from '~/components/MainNav.vue'
import Footer2 from '~/components/Footer2.vue'
export default {
  name: 'ReportsLayout',
  components: {
    MainNav,
    Footer2,
  },
  data () {
    return {
      
    }
  }
}
</script>

<template>
  <v-app id="app-width">
    <main-nav></main-nav>
    <v-main>
      <v-container pa-0 fluid>
        <v-layout align-center justify-center >
          <nuxt/>
        </v-layout>
      </v-container>
    </v-main>
    <footer2/>
  </v-app>
</template>

