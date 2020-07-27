<script>
import AddReport from "~/components/new_report/AddReport"
import AutoComplete from "~/components/common/AutoComplete";
import { mapState } from "vuex";


export default {
  layout: 'reports',
  name: 'MappingHolder',
  components: {
    AddReport,
    AutoComplete
  },
  data(){
    return {
      informer_type: '',
      want_add: false,
      is_mounted: false,
      suburb: undefined,
      show_map: false,
      //background: require("@/assets/background7.jpg"),
      //mapeo: require("@/assets/mapeo.png"),
      reports:[
        {title:'Primer Informe 2019', subtitle:'septiembre 2019', 
          url: 'https:facebook.com'}
      ],

    }
  },
  computed:{
    ...mapState({
      suburbs: state => state.suburbs,
    }),
  },
  methods: {
    sel_informer(type_re) {
      this.informer_type = type_re
      this.goToForm()
      this.want_add = true
      this.$ga.event({
        eventCategory: 'click',
        eventAction: 'select_profile',
      })
    },
    drawPin(state_id){
      this.$refs.map.colocatePin(state_id)
    },
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
  mounted(){
    console.log("me monto")
    this.is_mounted = true
    this.$store.dispatch('reports/FETCH_CATALOGS').then((resp)=>{
      console.log(resp)
      this.$nextTick( () =>{
        this.show_map = true
      })
    })
  }
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
          <AutoComplete
            v-if="true"
            :all_items="[3,4,5,6,7]"
            :model="'institution2'"
            label="Escribe tu colonia"
            class="mt-5"
            :field_text="'public_name'"
            :special_field="'public_name'"
            icon="search-location"
            style="max-width: 400px;"
          />
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
    <v-card v-if="false">
      <v-row justify="center" align="center" class="fill-height">
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