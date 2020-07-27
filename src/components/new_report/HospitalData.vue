<template>
  <div>
    <AutoComplete
      :all_items="states"
      :model="'state'"
      :label="'Escribe/Elige el Estado*'"
      :special_field="'other_names'"
      :field_text="'short_name'"
      :icon="'fa-map-marker-alt'"
      @input_change="addResponse($event)"
      style="max-width: 400px;"
    />
    <v-select
      v-model="report.institution"
      :items="institutions1"
      label="Institución"
      outlined
      item-text="public_name"
      item-value="id"
      hind="Elige una opción"
      @change="changeBasicInst()"
      prepend-icon="fa-hospital-alt"
      persistent-hint
      style="max-width: 400px;"
      :rules="[rules.defined_n]"
    ></v-select>
    <AutoComplete
      v-if="report.institution == 0"
      :all_items="institutions_others"
      :model="'institution2'"
      :label="'Escribe / Elige la Institución*'"
      :field_text="'public_name'"
      :special_field="'public_name'"
      :icon="'fa-hospital-alt'"
      style="max-width: 400px;"
      @input_change="addResponse($event)"
    />
    <AutoComplete
      :all_items="hospitals"
      :model="'hospital'"
      :label="'Escribe/Elige la Clínica u Hospital*'"
      :special_items="true"
      :field_text="'real_name'"
      :icon="'fa-clinic-medical'"
      @input_change="addResponse($event, false)"
      ref="AutoCompHosp"
    />
    <v-text-field
      v-if="isNaN(report.hospital) && report.hospital ? (report.hospital.length < 16 || report.state==0) : false"
      name="hospital"
      id="hospital"
      prepend-icon="fa-clinic-medical"
      outlined
      hint="Así podremos identificarlo mejor"
      label="Si puedes, déjanos más datos del hospital"
      v-model="report.hospital_string2"
    ></v-text-field>
    <v-row class="ml-0" align="center">
      <v-icon class="mb-2">fa-user-secret</v-icon>
      <v-col cols="11" sm="6" xs="5" class="mb-2 px-3 py-0 subtitle-1">
        ¿Crees que sea un caso de corrupción?
      </v-col>
      <v-col cols="12" sm="4" xs="5" class="pa-0" offset="1" offset-sm="0">
        <v-radio-group row v-model="report.has_corruption" :rules="[rules.defined_n]">
          <v-radio label="Sí" :value="true"></v-radio>
          <v-radio label="No" :value="false"></v-radio>
        </v-radio-group>                        
        <v-select
          v-if="false"
          :items="['sí','no']"
          label=""
          outlined
          v-model="report.has_corruption"
        ></v-select>
      </v-col>
    </v-row>
    <v-textarea
      :class="{'ml-8': $breakpoint.is.smAndUp}"
      v-if="report.has_corruption"
      name="input-7-1"
      outlined
      v-model="report.narration" 
      label="Explica por qué puede ser un caso de corrupción"
    ></v-textarea>    
  </div>
</template>


<script>

import { mapState } from "vuex";
import { mask } from 'vue-the-mask'
import reportMixin from "~/mixins/reportMixin"
import Supplies from "./Supplies"
import AutoComplete from "../common/AutoComplete";
//import Fuse from 'fuse.js';

export default {
  name: 'HospitalData',
  components: {
    Supplies,
    AutoComplete,
  },
  mixins: [reportMixin],
  directives: {
    mask,
  },
  props:{
  },  
  data(){
    return {
      report: {hospital: null, state: null, institution:null},
      hospitals: [],
      rules: {
        required: value => !!value || 'Campo Requerido.',
        defined_n: v => v !== undefined || 'Escribe la respuesta',
      },
    }
  },
  computed:{
    ...mapState({
      institutions: state => state.reports.institutions,
    }),
    institutions1(){
      console.log(this.$store.state.reports.institutions)
      //return []
      var insts = this.institutions.filter(ins=>ins.relevance==1)
      console.log(insts.push({'id': 0, 'public_name':'Otra'}))
      return insts
    },
    institutions_others(){
      //return []
      var insts = this.institutions.filter(ins=>ins.relevance!=1)
      return insts
    },
  },
  methods: {
    addResponse(ev, need_ch=true){
      console.log(ev)
      console.log(need_ch)
      this.report[ev.model] = ev.value
      if (need_ch)
        this.fetchFilterHosp()
    },
    changeBasicInst(){
      this.fetchFilterHosp()
    },
    loadData(){
      return this.report
    },
    fetchFilterHosp(){
      var rp = this.buidReport()
      this.$store.dispatch('reports/FETCH_HOSPITALS',{
      'institution': rp.institution || null,
      'state': rp.state ? rp.state : null}).then((response)=>{
        this.hospitals = response.results
        this.$refs.AutoCompHosp.buildItems()
      })
    },    
    goToForm(offset=30, elm_id='#save_form'){
      this.$vuetify.goTo(elm_id, 
        {duration: 400, offset: offset, easing:'easeInOutCubic'})
    },
    buidReport(){
      var rp = {}
      var rph = this.report

      if (rph.institution)
        rp.institution = rph.institution
      else if (!isNaN(rph.institution2))
        rp.institution = rph.institution2
      else if (rph.institution2){
        rp.is_other = true
        rp.institution_raw = rph.institution2
      }

      if (!isNaN(rph.hospital))
        rp.clues = rph.hospital
      else if (rph.hospital){
        rp.hospital_name_raw = rph.hospital
        if (rph.hospital_string2)
          rp.hospital_name_raw += ` ${rph.hospital_string2}`
      }

      if (!isNaN(rph.state))
        rp.state = rph.state
      else if (rph.state && rp.institution_raw)
        rp.institution_raw+=rp.state

      if (rph.has_corruption){
        rp.has_corruption = rph.has_corruption
        rp.narration = rph.narration
      }

      return rp
    }    
  },
  mounted(){
    this.$store.dispatch('reports/FETCH_HOSPITALS',{
      'institution': null, 'state': null}).then(response=>{
        this.hospitals = response.results
        this.$refs.AutoCompHosp.buildItems()
      })
  },
}
</script>

<style lang="scss" scoped>
.up-report{
  margin-top : -150px;
}
</style>