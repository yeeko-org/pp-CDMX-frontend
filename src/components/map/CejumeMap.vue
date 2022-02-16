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
      posX:-200,
      posY:-200,
      width: 980,
      state_id: 1,
      height: 640,
      axes: ['AMP', 'DPUB', 'VICT', 'MASC'],
    }
  },
  computed:{
    ...mapState({
      rows: state => state.cejume.rows ,
    }),
  },
  methods:{
    build_map(){

      var is_small = this.$breakpoint.is.smAndDown
      var vm = this

      const data3 = vm.rows.map(state=>{
        state.count = vm.axes.reduce((tot, axis)=> tot += (!!state[axis] ? 1 : 0) ,0)
        return state
      })
      console.log(data3)

      const projection = d3.geoMercator()
          .scale(1800)
          .center([-102, 26])

      const path = d3.geoPath()
          .projection(projection)
      
      const svg = d3.select('#ResultsMap')
          .attr("viewBox", [-20, 0, vm.width+40 , vm.height])
          //.style("width", "100%")
          .style("max-width", "1320px")

      /*var domain = d3.extent(this.ord_states, d=> d.count)
      var y = d3.scaleSqrt()
        .domain(domain)*/
      
      var y = d3.scaleLinear()
        .domain([1,4])

      var color_map4 = d3.scaleLinear([0, 1], ["#537f8f", "#00c69b"])

      var format_percent = d3.format(".1%")

      var percent_node = (prop, name) => {
        return prop[name] ? format_percent(prop[name] / prop.total) : '--'
      }
     
      const features = topojson.feature(map_json, map_json.objects.MEX_adm1).features.map((feat, idx)=>{
        feat.properties.algo = true 
        vm.axes.forEach(axis=>{
          feat.properties[axis] = Number(data3[idx][axis])
        })
        feat.properties.total = Number(data3[idx].Total)
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
            const count = data3[i].count
            return count ? color_map4(y(count)) : '#a7a7a7'
          })
          .on("click", clickNode)

      const height = svg.style("height");
      const real_height = Number(height.substr(0, height.length - 2));

      var tooltip = d3.select("body")
        .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("padding", "10px")
          .style("top", `${real_height - 150}px`)
          .style("left", "15px")
          .style("z-index", "10")
          .style("width", "360px")
          .style("height", "200px")
          .style("color", "white")
          .style("background-color", "rgb(29, 65, 79, 0.7)")
          .style("border-radius", "5px")
          .style("visibility", "visible")
          .text("");


          
      var isTooltipHidden = true;
      function clickNode(node) {
           // update visibility
            states.attr("stroke-width", 1)
            const elem = d3.select(this)
            elem.attr("stroke-width", 3)
           isTooltipHidden = !isTooltipHidden;
           var visibility = (isTooltipHidden) ? "hidden" : "visible";

           // load tooltip content (if it changes based on node)
           loadTooltipContent(node);
           
           if (isTooltipHidden) {
             unPinNode(node);
           }
        
           // place tooltip where cursor was
           /*return tooltip.style("top", (d3.event.pageY -10) + "px").style("left", (d3.event.pageX + 10) + "px").style("visibility", visibility);*/
        return true
      }

  
      // reset nodes to not be pinned
      function unPinNode(node) {
         node.fx = null;
         node.fy = null;
      }

      function loadTooltipContent(node) {
          var htmlContent = "<div style='font-family: Montserrat'>";
          htmlContent += `<h2 style="text-transform: uppercase; color: white; font-family: Montserrat">${node.properties.NAME_1}<\/h2>`
          htmlContent += "<div style='display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 10px;'>"
          vm.axes.forEach(axis=>{
            htmlContent += "<div>"
            htmlContent += `<img src="/icons/${axis}${node.properties[axis] ? '' : '-g'}.png" style="max-width: 100%;">`
            htmlContent += `<div 
              style='font-size: 15pt; font-weight: bold; text-align: center; font-family: Montserrat'
            > ${percent_node(node.properties, axis)} </div>`
            htmlContent += "</div>"
          })
          htmlContent += "<\/div>"
          htmlContent += "<\/div>"
          tooltip.html(htmlContent);
      }

      const initial_node = {
        NAME_1: 'NACIONAL',
        total: d3.sum(data3, d=> d.Total)
      }
      const initial_node2 = vm.axes.reduce((obj, axis)=>{
        return {...obj, ...{[axis]: d3.sum(data3, d=> d[axis])}} 
      }, initial_node)
      
      loadTooltipContent({properties: initial_node2})

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
  watch: {
  },  
  created(){
  },
  mounted(){
    //this.$store.dispatch('reports/FETCH_REPORTS').then((response)=>{
      //this.build_results()
      this.build_map()
    //})
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

    <v-card color="#31535e" class="tooltip" v-if="false">

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
  }


</style>