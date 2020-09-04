<script>
import AutoComplete from "~/components/common/AutoComplete";
import MapCDMX from "~/components/map/MapCDMX";
import MainHeader from "~/components/home/MainHeader";
import ppMixin from "~/mixins/ppMixin";
import { mapState, mapActions } from "vuex";
import * as d3 from 'd3';

export default {
  layout: 'reports',
  name: 'MappingHolder',
  components: { AutoComplete, MapCDMX, MainHeader},
  mixins: [ppMixin],
  data(){
    return {
      informer_type: '',
      want_add: false,
      is_mounted: false,
      suburb: undefined,
      show_map: false,
      suburbs_arr: undefined,
      complete_arr: undefined,
      budgets: [
        { name: 'Aprobado', key_name: 'approved'},
        { name: 'Modificado', key_name: 'modified'},
        { name: 'Ejercido', key_name: 'executed'},
      ],
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
      categories: state => state.reports.categories,
      suburb_types: state => state.reports.suburb_types,
      selected_suburb: state => state.reports.selected_suburb,
      suburb_id: state => state.reports.suburb_id,
    }),
    _suburbs_arr(){
      var insts = this.institutions.filter(ins=>ins.relevance==1)
      return insts
    },
    found_suburb(){
      try{
        let real = this.selected_suburb.final_projects[0]
        let manual = JSON.parse(real.manual_capture || "{}")
        console.log(real)
        let has_real = real.approved !== null
        let progress = has_real ? real.progress : manual.progress
        if (progress>2)
          progress = progress / 100
        return {
          approved: has_real ? real.approved : manual.approved,
          modified: has_real ? real.modified : manual.modified,
          executed: has_real ? real.executed : manual.executed,
          progress: progress
        }
      }
      catch(err){
        return {}
      }
    },
    winer_project(){
      return this.all_projects.length 
        ? this.all_projects[0]
        : {name_iecm: 'No disponible'}
    },
    category_winer(){
      if (!this.winer_project) return null
      try{
        return this.categories.find(cat=>
          cat.id == this.winer_project.category_iecm)
      }
      catch(err){
        return null
      }
    },
    final_project(){
      try{
        return this.selected_suburb.final_projects[0]
      }
      catch(err){
        return {}
      }
    },
    all_projects(){
      try{
        return this.selected_suburb.final_projects[0].projects
      }
      catch(err){
        return []
      }
    },
    fast_suburb(){
      if (this.suburb_id)
        return this.suburbs.find(sub=>sub.id==this.suburb_id)
      else
        return null
    }
  },
  watch:{
    suburbs(subs){
      //let baseData = [...subs]
      //return 
      this.townhalls.map(th=>{
        th.name_upper= th.name.toUpperCase()
      })
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
      this.suburbs_arr = builded_data

    }
  },
  created(){
    this.fetchCatalogs().then(cats=>{
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
    formatAmmount(val){
      if (isNaN(val))
        return "-"
      else
        return d3.format("($,.2f")(val)
    },
  },  
}
</script>

<template>
  <div style="width: 100%">
    <v-img 
      v-if="true"
      style="max-height: 450px;"
      dark 
      src="/background-7.png"
      min-height="300"
      max-height="420"
      id="header"
      :class="{'py-4': $breakpoint.is.xs,
        'py-10': $breakpoint.is.smAndUp}"
    >
      <span 
        id="wacha"
        v-intersect="propIntersect"
        section="intro"
      ></span>
      <v-row 
        align="end"
        class="pa-2 fill-height">
        <v-col 
          v-if="false"
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
    <MainHeader />
    <v-card
      id="search"
      flat 
      tile 
      min-height="320"
      color="primary lighten-4"
      class="py-4"
    >
      <v-row justify="center" align="center" class="fill-height" no-gutters>
        <v-col align="center" justify="center" cols="12" sm="8" md="6" class="px-2">
          <v-icon
            x-large
            color="accent darken-1"
            v-intersect="propIntersect"
            section="search"
          >fa-search-location</v-icon>
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
          <v-card v-if="fast_suburb" class="mb-5">
            <v-card-title primary-title>
              <span class="mr-2 text-uppercase">{{fast_suburb.st_obj.name}}</span>
              {{fast_suburb.name}}<v-spacer></v-spacer>
              {{fast_suburb.townhall_obj.name}}
            </v-card-title>
            <v-card-text class="text-left">
              Nombre del proyecto:
              <span 
                class="float-right text-h6 font-weight-bold primary--text mt-n3"
              >2018</span>
              <br>
              <span class="text-subtitle-1 black--text">
                {{found_suburb.description_cp  || winer_project.name_iecm}}
              </span>
              <v-chip 
                v-if="category_winer"
                dark
                :color="category_winer.color"
              >
                <v-icon class="mr-2" small>{{category_winer.icon}}</v-icon>
                {{category_winer.name}}
              </v-chip>
              <v-row>
                <v-col cols="4" class="pt-6">
                  Progreso de la obra: <br>
                  <div class="body-1 black--text text-center mb-2">
                    {{found_suburb.progress * 100 }}%
                  </div>
                  <template v-if="false">
                    Anomalías:
                    <v-chip dark color="primary lighten-2">
                      Un solo proyecto
                    </v-chip>
                  </template>
                </v-col>
                <v-col cols="8">
                  <v-simple-table dense>
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">Presupuesto</th>
                          <th class="text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="budget in budgets" :key="budget.key_name">
                          <td>{{ budget.name }}</td>
                          <td class="text-right">
                            {{ formatAmmount(found_suburb[budget.key_name])}}
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-col>
                <v-col cols="12">
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      {{all_projects.length}} propuestas 
                      <span class="grey--text ml-3">
                        ({{final_project.total_votes}} votos en total)
                      </span>
                       
                     </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-simple-table dense>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left"></th>
                              <th class="text-left px-0">Nombre</th>
                              <th class="text-right">Votos</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="proj in all_projects" :key="proj.id">
                              <td>
                                <v-icon color="yellow darken-2" v-if="proj.is_winer">
                                  fa-trophy
                                </v-icon>
                              </td>
                              <td class="px-0">{{ proj.name_iecm }}</td>
                              <td class="text-right">{{ proj.votes }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                      
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>                  
                </v-col>
              </v-row>
            </v-card-text>

          </v-card>
        </v-col>
      </v-row>
    </v-card>
    <MapCDMX v-if="show_map" id="map"/>
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
    <v-card id="viz" class="ma-2 px-4 text-center">
        <v-icon class="mt-4" large>fa-chart-bar</v-icon> 
      <v-card-text class="text-subtitle-1">
        Visualización en Construcción. Proximamente disponible
        <v-icon>fa-laptop-code</v-icon>
      </v-card-text>
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