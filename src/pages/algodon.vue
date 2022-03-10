<script>
import AutoComplete from "~/components/common/AutoComplete";
import MapCDMX from "~/components/map/MapCDMX";
import DataViz from "~/components/map/DataViz";
import MainHeader from "~/components/home/MainHeader";
import ppMixin from "~/mixins/ppMixin";
import { mapState, mapActions } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'MappingHolder',
  layout: 'reports',
  components: { AutoComplete, MapCDMX, MainHeader, DataViz},
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
      tab: 0,
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
      periods: state => state.reports.periods,
    }),
    _suburbs_arr(){
      var insts = this.institutions.filter(ins=>ins.relevance==1)
      return insts
    },
    found_suburb(){
      try{
        let real = this.selected_suburb.final_projects[0]
        let manual = JSON.parse(real.manual_capture || "{}")
        //console.log(real)
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
    },
    final_projects(){
      if (!this.selected_suburb)
        return []
      let fps = this.selected_suburb.final_projects
        .slice().sort((a,b)=> d3.descending(a.year, b.year))
      return fps.map(fp=>{
        try{
          return {...fp, ...fp.rows[0]}
        }
        catch(err){
          console.log(err)
          return fp
        }
      })

    },
    is_vertical(){
      return this.$breakpoint.is.mdAndUp
    },
  },
  watch:{
    suburbs(subs){
      //let baseData = [...subs]
      //return 
      if (!this.townhalls)
        return []
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
    this.fetchCatalogs2().then((data)=>{
      this.$nextTick( () =>{
        this.show_map = true
        this.calculateAxes()
      })
    })
    
  },
  methods: {
    ...mapActions({
      fetchCatalogs : 'reports/FETCH_CATALOGS',
      fetchCatalogs2: 'reports/FETCH_CATALOGS_SESNA',
      savePersona: 'reports/SAVE_PERSONA',      
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
    formatSimple(num){
      return d3.format(".3s")(num)
    },
  },
}
</script>

<template>
  <div v-if="true">HOLA MUNDO</div>
  <div style="width: 100%" id="app-width" v-else>
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
      color="#e76e69"
      class="py-4"
    >
      <v-row justify="center" align="center" class="fill-height" no-gutters>
        <v-col align="center" justify="center" cols="12" sm="10" md="8" class="px-2">
          <v-icon
            x-large
            color="white"
            v-intersect="propIntersect"
            section="search"
          >fa-search-location</v-icon>
          <br>
          <div class="text-h5 mt-3 white--text">
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
            <v-tabs
              class="text-left"
              v-model="tab"
              :vertical="is_vertical"
              optional
              show-arrows
              :style="{'max-width': `${$vuetify.breakpoint.width-8}px`}"
            >
              <v-divider></v-divider>
              
              <template v-for="fp in final_projects">
                <v-tooltip bottom :color="category_winer.color">
                  <template v-slot:activator="{ on }">
                    <v-tab 
                      v-on="on"
                      class="text-left"
                      style="justify-content: start;"
                      _change="getProbDetails(prob)"
                    >
                      <span class="mr-3">{{fp.year}}</span>
                      <v-icon class="mx-2" small :color="category_winer.color" v-if="false">
                        {{category_winer.icon}}
                      </v-icon>
                      <v-icon color="red" small class="mx-2" v-if="fp.anomalies.length">
                        fa-exclamation-circle
                      </v-icon>
                      <v-spacer></v-spacer>
                      ${{formatSimple(fp.executed)}}
                    </v-tab>
                  </template>
                  <div>
                    {{fp.project_name}}
                    <br>
                    <v-chip 
                      v-if="category_winer && false"
                      outlined
                      _color="category_winer.color"
                      color="white"
                    >
                      <v-icon class="mr-2" small>{{category_winer.icon}}</v-icon>
                      {{category_winer.name}}
                    </v-chip>
                  </div>
                </v-tooltip>
              </template>
              <v-tab-item v-for="(fp, index) in final_projects">
                <v-card outlined tile>
                  <v-card-text class="text-left">
                    <template v-if="false">
                      Categoría:
                      <br>
                      <v-chip 
                        v-if="category_winer"
                        dark
                        :color="category_winer.color"
                      >
                        <v-icon class="mr-2" small>{{category_winer.icon}}</v-icon>
                        {{category_winer.name}}
                      </v-chip>
                    </template>
                    <span 
                      class="float-right text-h6 font-weight-bold primary--text mt-n3"
                    >{{fp.year}}</span>
                    <br>
                    Nombre del proyecto:
                    <br>
                    <span class="text-subtitle-1 black--text font-weight-bold">
                      {{fp.project_name  || 'Desconocido'}}
                    </span>
                    <br>
                    Descripción:
                    <br>
                    <span class="text-subtitle-2 black--text font-weight-regular">
                      {{fp.description  || 'Sin descriptión'}}
                    </span>
                    
                    <v-row class="mt-3">
                      <v-col cols="8">
                        <v-divider></v-divider>
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
                                  {{ formatAmmount(fp[budget.key_name])}}
                                </td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-col>
                      <v-col cols="4" class="pa-1 text-center mt-2">
                        <v-card class="pa-2" color="cyan  lighten-4">
                          Estado de avance reportado:
                          <br>
                          <div class="headline black--text mb-2 mt-2">
                            {{fp.progress * 100 }}%
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12">
                        <v-expansion-panels>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              {{fp.projects.length}} propuestas 
                              <span class="grey--text ml-3">
                                ({{fp.total_votes}} votos en total)
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
                                    <tr v-for="proj in fp.projects" :key="proj.id">
                                      <td>
                                        <v-icon color="yellow darken-2" v-if="proj.is_winner">
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
                      <v-col cols="12" v-if="fp.anomalies.length">
                        <v-icon color="purple" class="mx-2" v-if="false">fa-question-circle</v-icon>
                        Anomalías encontradas:
                        <br>
                        <v-tooltip 
                          v-for="anomaly in fp.anomalies"
                          :key="anomaly.id"
                          top 
                        >
                          <template v-slot:activator="{ on }">
                            <v-chip 
                              v-on="on"
                              color="red"
                              dark
                            >
                              <v-icon class="mr-2" small>fa-exclamation-circle</v-icon>
                              {{anomaly.name}}
                            </v-chip>
                          </template>
                          <span>{{anomaly.description}}</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </v-card-text>


                </v-card>

                <v-card flat color="cyan lighten-5" tile v-if="false">
                  <ProbHeader :prob="prob" :is_prior="is_prior"/>
                  <v-divider></v-divider>
                  <Priorization 
                    :prob="selected_prob" 
                    :show="show_content" 
                    v-if="is_prior"
                    :year="curr_year"
                  />
                  <v-card-text v-else>
                    <v-alert
                      prominent
                      type="info"
                      elevation="2"
                    >
                      {{is_report ?  'Reporta los avances de las acciones que priorizaste y definiste' 
                        : 'Captura los detalles de implementación para cada acción priorizada'}}
                    </v-alert>
                    <v-row class="pa-4" v-if="loading_problematic" justify="center">
                      <v-progress-circular :size="50" color="#de006e" indeterminate>
                      </v-progress-circular>
                    </v-row>
                    <div
                      v-for="comp in filtered_comps"
                      :key="comp.id"
                    >
                      <v-subheader class="mt-5 subtitle-1">
                        <span><b class="mr-1">Proyecto:</b>{{comp.short_name}}</span>
                      </v-subheader>
                      <v-divider></v-divider>
                      <ActionsDefine
                        v-for="al in comp.filtrered_al"
                        :key="al.id"
                        :al="al"
                        :is_report="is_report"
                      />
                    </div>
                  </v-card-text>
                  <ActionsDefine
                    v-if="false"
                    :prob="selected_prob"
                    :show="show_content"
                  />
                  
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="tab != 0"
                      text
                      class="mb-4"
                      @click="changeTab(index, false)"
                      color="primary"
                    >
                      Problemática Anterior
                    </v-btn>
                    <v-btn
                      color="secondary"
                      v-if="tab+1 != problematics.length"
                      outlined
                      class="mb-4"
                      @click="changeTab(index)"
                    >
                      Problemática Siguiente
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
    <MapCDMX v-if="show_map" id="map"/>
    <DataViz id="viz"/>
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