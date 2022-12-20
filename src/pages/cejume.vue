<script>
import CejumeMap from "~/components/map/CejumeMap"
import { mapMutations, mapActions } from "vuex";

export default {
  layout: 'diamonds',
  name: 'Cejume',
  components: { CejumeMap },
  data(){
    return {
      show_map: false,
    }
  },
  computed:{
  },
  created(){
    //this.setDesign(false)
  },
  mounted(){
    this.setCejume()
    this.$nextTick( () =>{
      this.show_map = true
    })
    /*this.$store.dispatch('cejume/FETCH_CATALOGS4').then((data)=>{
      console.log(data)
      this.$nextTick( () =>{
        this.show_map = true
      })
    })*/
  },
  watch:{
  },
  methods: {
    ...mapMutations({
      setCejume : 'cejume/SET_CEJUME',
    }),
  },  
}
</script>

<template>
  <v-flex fluid style="width: 100%">
    <v-row>
      <v-col cols="12" v-if="show_map" order="4">
        <CejumeMap ref="map"/>
      </v-col>
    </v-row>
  </v-flex>
</template>

<style lang="scss">
@import '../assets/util.scss';
</style>