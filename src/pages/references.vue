<script>

import * as d3 from 'd3';

export default {
  name: 'ReportsLayout',
  layout: 'diamonds',
  components: {  },  
  data () {
    return {
      width: 2200,
      height: 1700,
      radius: 12,
      url_image: '',
      circles: [
        {
          "x": 497,
          "y": 594
        },
        {
          "x": 889,
          "y": 597
        },
        {
          "x": 1317,
          "y": 598
        },
        {
          "x": 1462,
          "y": 590
        },
        {
          "x": 1650,
          "y": 594
        },
        {
          "x": 1832,
          "y": 594
        },
        {
          "x": 2010,
          "y": 596
        }
      ],
      circles2: [
        { "x": 111, "y": 448 },
        { "x": 2118, "y": 1390 }
      ],
    }
  },
  computed:{
  },
  mounted(){
    this.drawImage()
  },
  watch:{
    url_image(after, before){
      console.log("hola mundo")
      d3.select("#back_image")
        .attr('xlink:href', after)
    }
  },
  methods:{
    drawImage(){
      let vm = this
      let circles = vm.circles
      let circles2 = vm.circles2

      /*let circles = d3.range(1).map(i => 
          i ? {
            x: ((1/10) *i) * (vm.width - vm.radius * 2) + vm.radius,
            y: ((1/10)* i) * (vm.height - vm.radius * 2) + vm.radius,
          } : {x:20, y: 40});*/

      var svg = d3.select("#imageback")
        //.attr("width", vm.width / 2)
        //.attr("height", vm.height / 2)
        .attr("viewBox", [0, 0, vm.width, vm.height])
      
      let url = "https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/2014/PP-2014-AO_0001.png"
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
          console.log(d)
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

      svg.selectAll("diamonds")
        .data(circles)
        .join("path")
          .attr("d", "M 20 0 40 40 20 80 0 40 Z")
          .style("stroke-width", 1)
          .attr("fill", (d, i) => d3.schemeCategory10[i+2])
          .attr("transform", d => `translate(${d.x - 20}, ${d.y - 40})`)
          .call(drag(1));

      svg.selectAll("diamonds2")
        .data(vm.circles2)
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
    <v-card-title primary-title>
      Ubica las referencias arrastrando los rombos
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
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
      <v-btn color="success">Guardar referencias</v-btn>
    </v-card-actions>
    chicos: {{circles}}
    <br>
    grandes: {{circles2}}
    <v-text-field
      name="url"
      style="max-width: 800px"
      outlined
      v-model="url_image"
      label="Imagen forzada"
      id="id"
    ></v-text-field>
  </v-card>
</template>