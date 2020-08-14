<script>
import { mapState, mapActions, mapGetters } from "vuex";
//import mixinLegend from "./mixinLegend";
import ppMixin from "~/mixins/ppMixin";

import * as d3 from 'd3';
import * as topojson from 'topojson';
import * as d3Tile from "d3-tile";

export default {
  name: 'MapCDMX',
  components: {
  },
  mixins: [ppMixin],
  props:{
  },
  data(){
    return{
      /*is_tooltip: false,
      tt_data: undefined,
      posX:-200,
      posY:-200,*/
      loaded_data: false,
      zoom_townhall: undefined,
      width: 640,
      height: 700,
      devicePixelRatio: true,
      //initial_center: [-99.128918, 19.336736],
      initial_center: [-99.150003, 19.374390],
      //initial_scale: 1 << 19,
      initial_scale: 600000,
      access_token: 'pk.eyJ1Ijoicmlja3JlYmVsIiwiYSI6ImNrZDRtM2pkaDE2Mm4ycW8zbjl4NmhqNnkifQ.fXsECn7EtVBuGs9sidf94Q',
      map_style: 'rickrebel/ckdgtap4v0jo21ipev01hvpvw',
    }
  },
  computed:{
    ...mapState({
      suburbs_raw: state => state.reports.suburbs,
      //current_projects: state => state.reports.current_projects,
      selected_suburb: state => state.reports.selected_suburb,
      selected_suburb_shape: state => state.reports.selected_suburb_shape,
      data_builded: state => state.reports.data_builded,
    }),
    ...mapGetters({
      suburbs_geo: "reports/suburbs_geo",
      current_projects: "reports/project_indicators",
    }),
    domain_pob(){
      return d3.extent(this.suburbs_geo, d=> d.pob_2010)
    },
    domain_votes(){
      return d3.extent(this.current_projects, d=> d.participation)
    },
    quantile(){
      //var all_data=this.current_projects.map(x=>x.participation)
      //  .slice().sort((a,b)=> 
      //    d3.ascending(a, b))

      //let qu =(val) => d3.format('.4f')(d3.quantile(all_data,val))
      //console.log(d3.quantile(all_data,0.95))
      //console.log(d3.quantile(all_data,0.95))
      //return [qu(.005),qu(.01),qu(.02),qu(.03),qu(.05),qu(.1),qu(.2),qu(.5),
      //        qu(.5),qu(.65),qu(.8),qu(.9),qu(.95),qu(.97),qu(.98),qu(.99),qu(.995)]
      return 0

    }

  },
  watch:{
    /*data_builded(after){
      if (after)
        this.

    }*/
  },
  mounted(){
    //const features = topojson.feature(map_json, map_json.objects.MEX_adm1).features    
    this.getFinalProjects().then((proys)=>{
      d3.json("https://cdn-yeeko.s3-us-west-2.amazonaws.com/alcaldias.json")
        .then(topology => {
          //console.log(topology)
          this.limits_th = topojson.feature(topology, topology.objects.alcaldias)
          this.loaded_data=true
          this.build_map()
      })
    })
  },  
  methods:{
    ...mapActions({
      getFinalProjects : 'reports/FETCH_FINAL_PROJECTS',
      getSuburb : 'reports/GET_SUBURB',
    }),
    scale_color(val){
      return d3.scaleSequential([0, 1], d3.interpolateCool)(val)
    },
    scale_participation(val){
      return d3.scaleSqrt()
        .domain([0,.6])(val)      
    },
    scale_pob(val){
      return d3.scaleSqrt()
        .domain(this.domain_pob)
        .range([0.5, 6])(val)
    },
    url(x, y, z){
      return `https://api.mapbox.com/styles/v1/${this.map_style}/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=${this.access_token}`
    },
    build_map(){
      var is_small = this.$breakpoint.is.smAndDown
      var vm = this

      const projection = d3.geoMercator()
          .scale(1 / (2 * Math.PI))
          .translate([0, 0]);

      const render = d3.geoPath(projection);
  
      /*const path = d3.geoPath()
          .projection(projection)*/
      
      const svg = d3.select('#MapCDMX')
          //.attr("viewBox", [-20, 0, this.width+40 , this.height])
          .attr("viewBox", [0, 0, vm.width, vm.height]);

      const tile = d3Tile.tile()
          .extent([[0, 0], [vm.width, vm.height]])
          .tileSize(412);

      const zoom = d3.zoom()
          .scaleExtent([1 << 18, 1 << 24])
          .extent([[0, 0], [vm.width, vm.height]])
          .on("zoom", () => zoomed(d3.event.transform));

      let image = svg.append("g")
          .attr("pointer-events", "none")
        .selectAll("image");


      const path = svg.append("path")
          .attr("pointer-events", "none")
          .attr("stroke", "#dabdbd")
          .attr("fill", "none")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round");
      
      const suburb_selected = svg.append("path")
          .attr("fill", "#5c5ace")
          .attr('opacity', 0.65)

      let prov_square = [180, 20]
      const g_container = svg.append("g")
          .attr('transform', `translate(0,${this.height - prov_square[1]})`)

      let rect_container = g_container.append("rect")
          .attr("fill", "#5c3663eb")
          .attr('height', d=> prov_square[1])
          .attr('width', d=> prov_square[0])
          
          
          //.attr('cy', d=> this.height - prov_square[1])
      let prov_text = g_container
          //.append("tspan")
            .append("text")
            .attr("id", "prov_tag")
            .attr("font-size", "1em")
            .style('fill', 'white')
            .text("")
            .attr('x', 6)
            .attr('y', `${prov_square[1]-4}`)
            //.attr('transform', `translate(0,0)`)
            .attr('opacity', 0.65)
            .on("click", function(d) {
              //console.log(d)
              //console.log(last_transform)
              //last_transform.x+=1500
              //last_transform.y+=1500
              last_transform.k+=30000*3
              last_transform.x+=8260*3
              last_transform.y+=1640*3
              zoomed(last_transform)
            })
  


      var divisor = 1

      var suburb_circles = svg.append("g")
          .selectAll('circle')
          .data(vm.suburbs_geo)
          .join("circle")
          .classed("out_circle", true)
          .attr('opacity', 0.65)
          .attr('r', d=> vm.scale_pob(d.pob_2010))
          .attr('fill', d=> 
            vm.scale_color(vm.scale_participation(d.participation)))

      svg
        .call(zoom)
        .call(zoom.transform, 
          d3.zoomIdentity
            .translate(vm.width / 2, vm.height / 2)
            .scale(-vm.initial_scale)
            .translate(...projection(vm.initial_center))
            .scale(-1));

      var last_k = undefined

      var last_transform = undefined

      function zoomed(transform) {
        //console.log(transform)
        last_transform = transform
        const tiles = tile(transform);
        image = image.data(tiles, d => d).join("image")
            .attr("xlink:href", d => vm.url(...d))
            .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
            .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
            .attr("width", tiles.scale)
            .attr("height", tiles.scale);

        projection
            .scale(transform.k / (2 * Math.PI))
            .translate([transform.x, transform.y]);
        
        divisor = (transform.k / vm.initial_scale)**0.7
        suburb_circles
          .attr('cx', d=> projection(d.real_geo_point)[0])
          .attr('cy', d=> projection(d.real_geo_point)[1])
          .attr('r', d=> divisor * vm.scale_pob(d.pob_2010))
          .on("mouseover", d=>{
            vm.getSuburb([d.id]).then(res=>{
              prov_text
                .text(res.name)
              let particip = vm.suburbs_geo.find(sub=>
                sub.id == res.id).participation
              let final_col = vm.scale_color(vm.scale_participation(particip))
              suburb_selected
                .attr("d", render(vm.selected_suburb_shape))
                .attr("fill", final_col)
              rect_container
                .attr("fill", final_col)

            })
          })
        suburb_selected
          .attr("d", null)

        path.attr("d", render(vm.limits_th));
      }
    },
  },
}
</script>

<template>
  <v-row no-gutters>
    <v-col
      cols="12"
      sm="10"
      md="8"
      offset="0"
      offset-sm="1"
      offset-md="2"
      class="px-1 py-3"
    >
      <v-card id="MapCard">
        <div
          v-intersect="propIntersect"
          section="map"
          class="no-wrap text-left pa-4" 
        >
          <span class="text-h5">Mapa Interactivo</span>
          <v-icon class="ml-3 mb-3" large color="accent">
            fa-map-marked-alt
          </v-icon>
          <v-select
            :items="['Azcapotzalco','Álvaro Obregón']"
            v-model="zoom_townhall"
            label="Selecciona una Alcaldía"
            class="float-right"
            outlined
            style="max-width: 300px;"
          ></v-select>
          <br>
          <span class="grey--text">
            Interactúa con el mapa y sus elementos
          </span>
        </div>
        <svg v-if="true"
          id="MapCDMX"
        ></svg>
        <v-tooltip 
          v-if="false"
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
      </v-card>
    </v-col>
  </v-row>
</template>