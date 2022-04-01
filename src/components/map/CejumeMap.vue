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
      data: {state: {}, national: {}},
      visible_state: false,
      posX: -200,
      posY: -200,
      width: 980,
      state_id: 1,
      height: 640,
      real_height: 0,
      axes: ['AMP', 'DPUB', 'VICT', 'MASC'],
      cards: [
        {
          key: 'state',
          pos_x: 'left',
        },
        {
          key: 'national',
          pos_x: 'right',
          nat: true
        },
      ],
      axes_complete: [{
        key: 'AMP',
        persons: 'Agentes de ministerio público',
      },
      {
        key: 'DPUB',
        persons: 'Defensores públicos',
      },
      'DPUB', 'VICT', 'MASC'],
    }
  },
  computed:{
    ...mapState({
      rows: state => state.cejume.rows ,
    }),
    data3(){
      console.log(this.rows)
      const algo = this.rows.map(state=>{
        state.count = this.axes.reduce((tot, axis)=>
          //tot += (!!Number(state[axis]) ? 1 : 0) ,0)
          tot += (!!state[axis] ? 1 : 0) ,0)
        return state
      })
      console.log(algo)
      return algo
    },
    national_data(){
      const total = d3.sum(this.data3, d=> d.Total)
      const initial_node = {
        NAME_1: 'NACIONAL',
        total: total,
        national: true,
        url: null
      }
      return this.axes.reduce((obj, axis)=>{
        const sum = d3.sum(this.data3, d=> Numeber(d[axis]))
        return {...obj, ...{
          [axis]: sum,
          //[`${axis}_perc`]: this.format_perc(sum / total)
        }} 
      }, initial_node)

    }
  },
  mounted(){
    this.build_map()
    this.clearState()
    this.calcNational()
  },  
  methods:{
    format_perc(v, dec=0){
      return v ? d3.format(`.${dec}%`)(v) : '--'
    },
    format_tot(v, dec=0){
      return v ? d3.format(",")(v) : '0'
    },
    clearState(){
      //this.state_data = this.national_data
      this.visible_state = false
      d3.selectAll('.state-path')
        .attr('stroke-width', 1)
    },
    calcNational(){
      const total = d3.sum(this.data3, d=> d.Total)
      const initial_node = {
        NAME_1: 'NACIONAL',
        total: total,
        total_format: this.format_tot(total),
        national: true,
        url: null
      }
      this.data.national = this.axes.reduce((obj, axis)=>{
        const sum = d3.sum(this.data3, d=> d[axis])
        return {...obj, ...{
          [axis]: sum,
          [`${axis}_tot`]: this.format_tot(sum)
        }}
      }, initial_node)

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
          .attr("fill", "grey")

      var y = d3.scaleLinear()
        .domain([1,4])

      var color_map4 = d3.scaleLinear([0, 1], ["#537f8f", "#00c69b"])
     
      const features = topojson.feature(map_json, map_json.objects.MEX_adm1).features
        .map((feat, idx)=>{
          feat.properties.algo = true 
          const total_st = Number(vm.data3[idx].Total)
          vm.axes.forEach(axis=>{
            const numb = vm.data3[idx][axis] == ''
              ? null
              : Number(vm.data3[idx][axis])
            feat.properties[axis] = numb
            //feat.properties[`${axis}_perc`] = vm.format_perc(numb / total_st)
          })
          feat.properties.total = total_st
          feat.properties.total_format = vm.format_tot(total_st)
          feat.properties.url = vm.data3[idx].link
          return feat
        })

      /*function mouseMove(d, event) {
        const width_svg = svg.style("width");
        const real_width = Number(width_svg.substr(0, width_svg.length - 2));
        const limit_right = is_region ? 300 : 80;
        const final_left =
          event.offsetX > real_width - limit_right
            ? real_width - limit_right - 30
            : event.offsetX;
        tooltip
          .style("left", `${final_left}px`)
          .style("top", `${event.offsetY}px`);
      }
      function mouseVis(show = false) {
        tooltip.style("visibility", show ? "visible" : "hidden");
      }
      function mouseOver(d, event) {
        mouseMove(d, event);
        mouseVis(d, event, true);
      }*/

      var states = svg
        .selectAll('path')
        .data(features)
          .join('path')
          .attr("d", path)
          .attr("class", "state-path")
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .attr('fill', (d, i) => {
            const count = vm.data3[i].count
            return count ? color_map4(y(count)) : '#a7a7a7'
          })
          .on("click", clickNode)
          .on("mouseover", mouseOver)
          .on("mouseleave", mouseLeave)
          //.on("mousemove", d => mouseMove(d, event))
          //.on("mouseleave", () => mouseVis(false));


      const height = svg.style("height");
      vm.real_height = Number(height.substr(0, height.length - 2));

      function mouseOver(node) {
        const elem = d3.select(this)
        console.log(elem)
        elem.attr('fill-opacity', 0.6)
      }

      function mouseLeave(node) {
        //const elem = d3.select(this)
        states.attr('fill-opacity', 1)
      }

      function clickNode(node) {
        // update visibility
        states.attr("stroke-width", 1)
        const elem = d3.select(this)
        elem.attr("stroke-width", 3)
        console.log(node.properties)
        vm.data.state = node.properties
        vm.visible_state = true
      }

      this.legend({
        color: d3.scaleSequential([1, 4], color_map4),
        title: "Número de programas",
        ticks: 4,
        //fontSize: is_small ? 14 : 9,
        //marginLeft: is_small ? 600 : 600,
        //marginTop: is_small ? 60 : 60,
        //height: is_small ? 95 : 95,
        //width: is_small ? 890 : 890,
        fontSize: 9,
        marginLeft: 700,
        marginTop: 300,
        height: 335,
        width: 990,
        cejume: true,
      })
      console.log(svg)

    },
  },
}
</script>

<template>
  <div id="MapCard" color="grey darken-3">
    <v-card-title class="no-wrap" v-if="false">AVANCE EN IMPLEMENTACIÓN</v-card-title>
    <!--<v-text-field
      outlined
      label="Estado id"
      v-model="state_id"
    ></v-text-field>    
    <v-btn color="success" @click="colocatePin(state_id)">pin</v-btn>-->
    <svg 
      id="ResultsMap"
    ></svg>
    <template v-for="card in cards">
      <v-card 
        v-if="card.nat || visible_state"
        color="#31535e"
        class="tooltip"
        _class="{'tooltip-xs': $breakpoint.is.xsOnly}"
        :class="`${$breakpoint.is.xsOnly ? 'tooltip-xs' : ''}`"
        :style="`top: ${card.nat
          ? ($breakpoint.is.xsOnly ? real_height : 20)
          : (real_height - ($breakpoint.is.xsOnly ? 0 : 260))}px;
          ${card.pos_x}: ${$breakpoint.is.xsOnly ? 5 : 15}px;`"
      >
        <v-card-title
          class="pa-0 white--text text-sm-h4"
          :class="`text-${$breakpoint.is.xsOnly ? 'subtitle-1' : 'h6' }`"
        >
          <div class="monse font-weight-bold">{{data[card.key].NAME_1}}</div>
          <v-spacer></v-spacer>
          <v-btn
            v-if="data[card.key].url"
            color="grey"
            icon
            @click="clearState"
          >
            <v-icon>fa-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-row>
          <v-col cols="3" v-for="axis in axes" class="px-1 px-sm-2" :key="axis">
            <v-img
              :src="`/icons/${axis}${data[card.key][axis] == null ? '-g' : ''}.png`"
              :style="`max-width: 100%;
                opacity: ${data[card.key][axis] === null ? .5 : 1};`"
            ></v-img>
            <div 
              v-if="card.nat"
              class="text-center percent-text white--text monse"
              :class="{'percent-text-xs': $breakpoint.is.xsOnly}"
            >
              {{data[card.key][`${axis}_tot`]}}
            </div>
            <span v-else-if="false">{{data[card.key][axis]}} </span>
          </v-col>
          <v-col
            v-if="!card.nat"
            cols="12"
            class="text-center percent-text white--text monse"
            :class="{'percent-text-xs': $breakpoint.is.xsOnly}"
          >
            Total de participantes: {{data[card.key].total_format}}
          </v-col>
        </v-row>
        <v-card-actions v-if="data[card.key].url" class="py-1 py-sm-2">
          <v-spacer></v-spacer>
          <v-btn
            color="#04c59c"
            rounded
            :href="data[card.key].url"
            target="_blank"
            :small="$breakpoint.is.xsOnly"
            class="monse white--text"
          >
            Ir al micrositio
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </template>
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
    <v-card v-if="false">
      {{data3}}
    </v-card>
  </div>
</template>
<style lang="scss">
  
  .tooltip{
    position: absolute;
    padding: 10px;
    z-index: 10;
    width: 380px;
  }

  .tooltip-xs{
    width: 190px;
  }

  .monse{
    font-family: Montserrat !important;
  }

  .percent-text{
    font-size: 15pt;
    font-weight: bold;
    text-align: center;
    font-family: Montserrat
  }

  .percent-text-xs{
    font-size: 10pt;
  }

</style>