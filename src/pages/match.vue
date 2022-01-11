<script>

import { mapActions, mapState } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'MatchReview',
  layout: 'diamonds',
  components: {  },  
  data () {
    return {
      loading: true,
      excercises: [],
      match_review: false,
      general_comment: "",
    }
  },
  computed:{
    ...mapState({
      public_accounts: state => state.reports.public_accounts,
      curr_pa_idx: state => state.reports.curr_pa_idx,
      pa_in_review: state => state.reports.pa_in_review,
    }),
    remain_rows(){
      //return []
      return this.pa_in_review.orphan_rows.filter(row=>
        !this.excercises.some(exer=> exer.seq == row.seq) )
      var all_data=this.current_projects.map(x=>x.participation)
        .slice().sort((a,b)=> 
          d3.ascending(a, b))
    },
  },
  created(){
    this.fetchPublicAccounts('?orphan_rows=true&match_review=false')
  },  
  mounted(){
  },
  watch:{
    curr_pa_idx(after){
      this.loading = true
      this.getPublicAccount(after).then(res=>{
        this.excercises = this.pa_in_review.final_projects.map(proj=>(
          { suburb: proj.suburb, seq: undefined, sub_name: proj.suburb_short_name }
        ) )
        this.match_review = false
        this.general_comment = res.comment_match
        this.loading = false
      })
    },    
  },
  methods:{
    ...mapActions({
      fetchPublicAccounts : 'reports/FETCH_PUBLIC_ACCOUNTS',
      getPublicAccount : 'reports/GET_PUBLIC_ACCOUNT',      
      postPublicAccount : 'reports/POST_PUBLIC_ACCOUNT',      
    }),
    savePublicAccount(){
      let new_data = {
        matches: this.excercises,
        match_review: this.match_review,
        comment_match: this.general_comment
      }
      //console.log(new_data)
      this.loading = true
      this.postPublicAccount(new_data).then(res=>{
        this.$vuetify.goTo(0,
          {duration: 400, offset: 20, easing:'easeInOutCubic'})

      })
    },
    custom_remain(exer){
      return exer.seq
        ? [...[this.pa_in_review.orphan_rows.find(row=>row.seq == exer.seq)],
          ...this.remain_rows]
        : this.remain_rows
    },
  },

}
</script>

<template>
  <v-card>
    <v-card-title primary-title class="pb-0">
      Indica las colonias a las cuales se refería en cada caso
    </v-card-title>
    <v-row class="mx-0" v-if="pa_in_review">
      <v-col cols="12" v-if="false">
        Ubica los rombos grandes al comienzo y al final de los datos
        <br>Los rombos pequeños, si hay, en la división entre las columnas
      </v-col>
      <v-col cols="8" v-if="true" style="border-right: 2px solid grey;">
        <v-row v-for="exer in excercises">
          <v-col cols="5">
            {{ exer.sub_name }}
          </v-col>
          <v-col cols="7">
            <v-select
              :items="custom_remain(exer)"
              clearable
              v-model="exer.seq"
              item-value="seq"
              item-text="data[0]"
              label="Colonia con la que coincide"
            ></v-select>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4">
        <v-banner 
          tile
          single-line
          sticky 
          app
          color="white"
          class="pa-0"
          elevation="1"
        >
          <div class="text-h6 mb-4"> Filas no insertadas </div>
          <div v-for="row in remain_rows">
            {{row.data[0]}}
          </div>
          <v-alert 
            v-if="!remain_rows.length"
            type="success" 
            outlined
          >
            Todas las filas se insertaron
          </v-alert>
        </v-banner>
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="general_comment"
          name="comments"
          hide-details
          rows="2"
          auto-grow
          label="Comentarios de hallazgos"
          outlined
        ></v-textarea>
      </v-col>
    </v-row>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-checkbox 
        v-model="match_review"
        label="Marcar como completo"
        class="mr-3"
      ></v-checkbox>
      <v-btn color="success" :loading="loading" @click="savePublicAccount">
        Guardar ejercicio
      </v-btn>
    </v-card-actions>
  </v-card>
</template>