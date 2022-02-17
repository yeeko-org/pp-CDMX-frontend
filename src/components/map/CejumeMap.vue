<script>
import { mapState } from "vuex";
import { map_json } from './states.js';
import mixinLegend from "~/mixins/mixinLegend";

import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import * as topojson from 'topojson';

export default {
  name: 'ResultsMap',
  components: {
  },
  mixins: [mixinLegend],
  props:{
  },
  data(){
    return{
      is_tooltip: false,
      tt_data: undefined,
      state_data: {},
      posX:-200,
      posY:-200,
      width: 980,
      state_id: 1,
      height: 640,
      real_height: 0,
      axes: ['AMP', 'DPUB', 'VICT', 'MASC'],
    }
  },
  computed:{
    ...mapState({
      rows: state => state.cejume.rows ,
    }),
    data3(){
      return this.rows.map(state=>{
        state.count = this.axes.reduce((tot, axis)=> tot += (!!state[axis] ? 1 : 0) ,0)
        return state
      })
    }
  },
  mounted(){
   
    this.build_map()
    console.log(this.data3)
    const total = d3.sum(this.data3, d=> d.Total)
    const initial_node = {
      NAME_1: 'NACIONAL',
      total: total,
      url: null
    }
    this.state_data = this.axes.reduce((obj, axis)=>{
      const sum = d3.sum(this.data3, d=> d[axis])
      return {...obj, ...{
        [axis]: sum,
        [`${axis}_perc`]: this.format_perc(sum / total)
      }} 
    }, initial_node)

  },  
  methods:{
    format_perc(v, dec=1){
      return (!Number.isNaN(v)) ? d3.format(`.${dec}%`)(v) : '-'
    },    
    build_map(){

      var is_small = this.$breakpoint.is.smAndDown
      var vm = this

      const projection = d3.geoMercator()
          .scale(1800)
          .center([-102, 26])

      const path = d3.geoPath()
          .projection(projection)
      
      const svg = d3.select('#ResultsMap')
          .attr("viewBox", [-20, 0, vm.width+40 , vm.height])
          //.style("width", "100%")
          .style("max-width", "1320px")

      var y = d3.scaleLinear()
        .domain([1,4])

      var color_map4 = d3.scaleLinear([0, 1], ["#537f8f", "#00c69b"])

      var format_percent = d3.format(".1%")

      var percent_node = (prop, name) => {
        return prop[name] ? format_percent(prop[name] / prop.total) : '--'
      }
     
      const features = topojson.feature(map_json, map_json.objects.MEX_adm1).features
        .map((feat, idx)=>{
          feat.properties.algo = true 
          const total_st = Number(vm.data3[idx].Total)
          vm.axes.forEach(axis=>{
            const numb = Number(vm.data3[idx][axis])
            feat.properties[axis] = numb
            feat.properties[`${axis}_perc`] = vm.format_perc(numb / total_st)
          })
          feat.properties.total = total_st
          feat.properties.url = vm.data3[idx].link
          return feat
        })

      var states = svg
        .selectAll('path')
        .data(features)
          .join('path')
          .attr("d", path)
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .attr('fill', (d, i) => {
            const count = vm.data3[i].count
            return count ? color_map4(y(count)) : '#a7a7a7'
          })
          .on("click", clickNode)

      const height = svg.style("height");
      vm.real_height = Number(height.substr(0, height.length - 2));

      function clickNode(node) {
        // update visibility
        states.attr("stroke-width", 1)
        const elem = d3.select(this)
        elem.attr("stroke-width", 3)
        vm.state_data = node.properties
      }      

      this.legend({
        color: d3.scaleSequential([1, 4], color_map4),
        title: "Número de programas",
        ticks: 4,
        fontSize: is_small ? 14 : 9,
        marginLeft: is_small ? 600 : 600,
        marginTop: is_small ? 60 : 60,
        height: is_small ? 95 : 95,
        width: is_small ? 890 : 890,
        cejume: true,
      })
      console.log(svg)

    },
  },
}
</script>

<template>
  <div  id="MapCard">
    <v-card-title class="no-wrap">AVANCE EN IMPLEMENTACIÓN</v-card-title>
    <!--<v-text-field
      outlined
      label="Estado id"
      v-model="state_id"
    ></v-text-field>    
    <v-btn color="success" @click="colocatePin(state_id)">pin</v-btn>-->
    <svg 
      id="ResultsMap"
    ></svg>

    <v-card 
      color="#31535e"
      class="tooltip"
      v-if="true"
      :style="`top: ${real_height - 180}px`"
    >
      <v-card-title primary-title class="monse pa-0 white--text text-h4">
        {{state_data.NAME_1}}
      </v-card-title>
      <v-row>
        <v-col cols="3" v-for="axis in axes" class="px-2" :key="axis">
          <v-img
            :src="`/icons/${axis}${state_data[axis] ? '' : '-g'}.png`"
            style="max-width: 100%;"
          ></v-img>
          <div class="text-center percent_text white--text">
            {{state_data[`${axis}_perc`]}}
          </div>

        </v-col>
      </v-row>
      <v-card-actions v-if="state_data.url">
        <v-spacer></v-spacer>
        <v-btn color="#04c59c" rounded :href="state_data.url" target="_blank">
          Ir al micrositio
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>


    <v-tooltip 
      color="green"
      bottom 
      v-model="is_tooltip"
      :position-x="posX"
      :position-y="posY"
    >
      <div
        v-if="tt_data"
        class="pa-3"
      >
        <span>
          {{tt_data.state}}
          <br> 
          {{tt_data.count}} reportes
        </span>
      </div>
    </v-tooltip>
  </div>
</template>
<style lang="scss">
  
  .tooltip{
    position: absolute;
    padding: 10px;
    left: 15px;
    z-index: 10;
    width: 360px;
    _height: 200px;
  }

  .monse{
    font-family: Montserrat;
  }

  .percent_text{
    font-size: 15pt;
    font-weight: bold;
    text-align: center;
    font-family: Montserrat
  }

</style>