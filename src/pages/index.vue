<script>
import AutoComplete from "~/components/common/AutoComplete";
import MapCDMX from "~/components/map/MapCDMX";
import { mapState, mapActions } from "vuex";

export default {
  layout: 'reports',
  name: 'MappingHolder',
  components: { AutoComplete, MapCDMX },
  data(){
    return {
      informer_type: '',
      want_add: false,
      is_mounted: false,
      suburb: undefined,
      show_map: false,
      suburbs_arr: undefined,
      complete_arr: undefined,
      //background: require("@/assets/background7.jpg"),
      //mapeo: require("@/assets/mapeo.png"),
      reports:[
        {title:'Primer Informe 2019', subtitle:'septiembre 2019', 
          url: 'https//:facebook.com'}
      ],

    }
  },
  computed:{
    ...mapState({
      suburbs: state => state.reports.suburbs,
      townhalls: state => state.reports.townhalls,
      suburb_types: state => state.reports.suburb_types,
    }),
    _suburbs_arr(){
      var insts = this.institutions.filter(ins=>ins.relevance==1)
      console.log(insts.push({'id': 0, 'public_name':'Otra'}))
      return insts
    },

  },
  watch:{
    suburbs(subs){
      //let baseData = [...subs]
      //return 
      this.townhalls.map(th=>{
        th.name_upper= th.name.toUpperCase()
      })
      console.log(Date.now())
      let last_th = undefined
      let last_st = undefined
      let last_th_id = 0
      let last_st_id = 0
      let builded_data = subs.map( sub=>{
        if(last_th_id != sub.townhall){
          last_th_id = sub.townhall
          last_th = this.townhalls.find(th=>th.id == last_th_id)
        }
        if(last_st_id != sub.suburb_type){
          last_st_id = sub.suburb_type
          last_st = this.suburb_types.find(st=>st.id == last_st_id)
        }
        sub.townhall_obj = last_th
        sub.st_obj = last_st
        return sub
      })
      console.log(Date.now())
      this.suburbs_arr = builded_data

    }
  },
  created(){
    this.fetchCatalogs().then(cats=>{
      console.log("se cargó el catálogo")
      this.show_map = true
    })
  },
  mounted(){
    this.is_mounted = true
  },
  methods: {
    ...mapActions({
      fetchCatalogs : 'reports/FETCH_CATALOGS',
    }),
    goToForm(offs=30){
      this.$vuetify.goTo('#save_form', 
        {duration: 400, offset: 30, easing:'easeInOutCubic'})
    },
    clickAdd(){
      console.log(this.$ga)
      this.$ga.event({
        eventCategory: 'click',
        eventAction: 'Open',
      })
    },
  },  
}
</script>

<template>
  <div style="width: 100%">
    <v-img 
      style="max-height: 450px;"
      dark 
      src="/background-7.png"
      min-height="300"
      max-height="450"
      id="header"
      :class="{'py-4': $breakpoint.is.xs,
        'py-10': $breakpoint.is.smAndUp}"
    >
      <v-row 
        align="end"
        class="pa-2 fill-height">
        <v-col 
          cols="12"
          align="center"
          justify="end"
          class="font-weight-bold"
        >
          <span
            class="blue-back  px-2 primary--text"
            :class="{'headline': $breakpoint.is.xs,
            'display-1': $breakpoint.is.smAndUp}"
          >
            Conoce todos los datos del
          </span>
          <br><br>
          <span 
            class="blue-back px-3"
            style="color: #bf2e1a"
            :class="{'display-1': $breakpoint.is.xs,
            'display-2': $breakpoint.is.smAndUp}"
          >
            Presupuesto Participativo
          </span>
        </v-col>
      </v-row>
    </v-img>
    <v-card height="320" flat color="primary lighten-4" tile>
      <v-row justify="center" align="center" class="fill-height">
        <v-col align="center" justify="center" cols="5">
          <v-icon x-large color="accent darken-1">fa-search-location</v-icon>
          <br>
          <div class="text-h5 mt-3">
            Busca tu colonia y entérate del histórico del presupuesto participativo
          </div>
          <v-skeleton-loader
            class="mx-auto"
            max-width="300"
            type="heading"
            :loading="!suburbs_arr"
          >
            <AutoComplete
              v-if="suburbs_arr"
              :all_items="suburbs_arr"
              :model="'institution2'"
              label="Escribe tu colonia o Alcaldía"
              class="mt-5"
              :field_text="'name'"
              icon="search-location"
              style="max-width: 400px;"
            />
            <div></div>
          </v-skeleton-loader>          
          <v-select
            v-if="false"
            :items="['Iztapaluca', 'Array']"
            v-model="suburb"
            label="Escribe tu colonia"
          >
            <template v-slot:prepend class="mt-0">
              <v-icon large>fa-search-location</v-icon>
              
            </template>
          </v-select>
        </v-col>
      </v-row>
    </v-card>
    <MapCDMX v-if="show_map"/>
    <v-card v-if="false">
      <v-row justify="center" align="center" class="fill-height" v-if="false">
        <v-col align="center" justify="center" cols="12">
          <div class="text-h4 mt-3 py-4">
            Mapa de la Ciudad de México
          </div>
          <iframe src="https://datos.cdmx.gob.mx/explore/embed/dataset/coloniascdmx/map/?location=11,19.35715,-99.13548&static=false&datasetcard=false&scrollWheelZoom=false"
            width="600" 
            height="700" 
            frameborder="0"
          ></iframe>
        </v-col>   
      </v-row>
    </v-card>
  </div>
</template>

<style lang="scss">
.blue-back {
  //background: rgb(38 54 146 / .8);
  //background: rgb(256 256 256 / .5);
  background: #8dc63f68;
}
@import '../assets/util.scss';
.up-report{
  margin-top : -40px !important;
}
</style>