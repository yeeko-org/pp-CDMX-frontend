<script>

import { mapActions } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'References',
  layout: 'diamonds',
  components: {  },  
  data () {
    return {
      width: 2200,
      height: 1700,
      radius: 12,
      //base_url: 'https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/',
      url_image: '',
      current_image: undefined,
      divisors: undefined,
      references: undefined,
      show_svg: false,
      loading: true
    }
  },
  computed:{
    base_url(){
      let base = 'https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/'
      return process.env.NODE_ENV == 'development' ? base : ''
    }
  },
  mounted(){
    this.getNext().then(res=>{
      console.log(res)
      this.loading = false
      this.show_svg = true
      this.current_image = res
      this.resetReferences()
      this.drawImage()
    })    
  },
  watch:{
    url_image(after, before){
      d3.select("#back_image")
        .attr('xlink:href', `${base_url}${after}`)
    }
  },
  methods:{
    ...mapActions({
      getNext : 'reports/GET_NEXT',
      postNext : 'reports/POST_NEXT',
    }),
    saveNext(){
      let new_data = {
        id: this.current_image.id,
        references: this.references,
      }
      this.loading = true
      if (this.current_image.divisors)
        new_data.divisors = this.divisors
      this.postNext(new_data).then(res=>{
        this.$vuetify.goTo(0,
          {duration: 400, offset: 20, easing:'easeInOutCubic'})

        this.loading = false
        d3.select("#back_image")
          .attr('xlink:href',  `${this.base_url}${res.url}`)
        this.current_image = res
        this.resetReferences()
        this.drawImage()
      })
    },
    resetReferences(){
      let bases = this.current_image.data
        ? [this.current_image.data.divisors, this.current_image.data.references]
        : [null, null]
      this.divisors = bases[0] || [{ "x": 497, "y": 594 },
              { "x": 889, "y": 597 },
              { "x": 1317, "y": 598 },
              { "x": 1462, "y": 590 },
              { "x": 1650, "y": 594 },
              { "x": 1832, "y": 594 },
              { "x": 2010, "y": 596 }]
      this.references = bases[1] || this.references
        || [ { "x": 111, "y": 448 }, { "x": 2118, "y": 1390 } ]
    },
    resetReferences_old(){
      this.divisors = [
        { "x": 497, "y": 594 },
        { "x": 889, "y": 597 },
        { "x": 1317, "y": 598 },
        { "x": 1462, "y": 590 },
        { "x": 1650, "y": 594 },
        { "x": 1832, "y": 594 },
        { "x": 2010, "y": 596 }
      ]
      this.references = [
        { "x": 111, "y": 448 },
        { "x": 2118, "y": 1390 }
      ]
    },
    drawImage(){
      let vm = this
      let circles = vm.divisors
      let circles2 = vm.references
      var svg = d3.select("#imageback")
        //.attr("width", vm.width / 2)
        //.attr("height", vm.height / 2)
        .attr("viewBox", [0, 0, vm.width, vm.height])
      console.log(svg)
      
      let url = `${vm.base_url}${vm.current_image.url}` // "https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/2014/PP-2014-AO_0001.png"
      //let url = vm.current_image.url
      svg.append('image')
        .attr('xlink:href', url)
        .attr('width', vm.width)
        .attr('id', 'back_image')


      function drag(cir_num){
        let vm = this
        function dragstarted(event, d) {
          d3.select(this).raise().attr("stroke", "black");
        }
        function dragged(event, d) {
          let circle = cir_num  == 1 ? circles[d] : circles2[d]
          circle.x = d3.event.x
          circle.y = d3.event.y
          d3.select(this).attr("transform",  
            `translate(${d3.event.x - (20 * cir_num) }, ${d3.event.y - (40 * cir_num) })`);
        }

        function dragended(event, d) {
          d3.select(this).attr("stroke", null);
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      }

      if (vm.current_image.divisors){
      svg.selectAll("diamonds")
        .data(circles)
        .join("path")
          .attr("d", "M 20 0 40 40 20 80 0 40 Z")
          .style("stroke-width", 1)
          .attr("fill", (d, i) => d3.schemeCategory10[i+2])
          .attr("transform", d => `translate(${d.x - 20}, ${d.y - 40})`)
          .call(drag(1));
      }

        svg.selectAll("diamonds2")
          .data(circles2)
          .join("path")
            .attr("d", "M 40 0 80 80 40 160 0 80 Z")
            .style("stroke-width", 1)
            .attr("fill", (d, i) => d3.schemeCategory10[i])
            .attr("transform", d => `translate(${d.x - 40}, ${d.y - 80})`)
            .call(drag(2));

    },
  },

}
</script>

<template>
  <v-card>
    <v-card-title primary-title class="pb-0">
      Ubica las referencias arrastrando los rombos
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" v-if="false">
          Ubica los rombos grandes al comienzo y al final de los datos
          <br>Los rombos pequeños, si hay, en la división entre las columnas
        </v-col>
        <v-col cols="12">
          <svg id="imageback">
            
          </svg>
        </v-col>

      </v-row>
      
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="success" :loading="loading" @click="saveNext">Guardar referencias</v-btn>
    </v-card-actions>
    <template v-if="false">
      chicos: {{divisors}}
      <br>
      grandes: {{references}}
      <v-text-field
        name="url"
        style="max-width: 800px"
        outlined
        v-model="url_image"
        label="Imagen forzada"
        id="id"
      ></v-text-field>
    </template>
  </v-card>
</template>