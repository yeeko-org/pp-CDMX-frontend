<script>
import { mapState, mapActions, mapGetters } from "vuex";
//import mixinLegend from "./mixinLegend";
import ppMixin from "~/mixins/ppMixin";
import mixinLegend from "./mixinLegend";

import * as d3 from 'd3';
import * as topojson from 'topojson';
import * as d3Tile from "d3-tile";

export default {
  name: 'MapCDMX',
  components: {
  },
  mixins: [ppMixin, mixinLegend],
  data(){
    return{
      posX: 200,
      posY: 200,
      loaded_data: false,
      click_on_sub_sel: false,
      zoom_townhall: undefined,
      sub_sel_id: true,
      sub_sel_data: undefined,
      width: 640,
      cancel_request: undefined,
      block_zoom: false,
      devicePixelRatio: true,
      //initial_center: [-99.128918, 19.336736],
      initial_center: [-99.150003, 19.374390],
      //initial_scale: 1 << 19,
      initial_scale: 600000,
      access_token: 'pk.eyJ1Ijoicmlja3JlYmVsIiwiYSI6ImNrZDRtM2pkaDE2Mm4ycW8zbjl4NmhqNnkifQ.fXsECn7EtVBuGs9sidf94Q',
      map_style: 'rickrebel/ckdgtap4v0jo21ipev01hvpvw',
      current_period: 1,
      periods:[
        { id: 3, year: 2014 },
        { id: 4, year: 2015 },
        { id: 5, year: 2016 },
        { id: 2, year: 2017 },
        { id: 1, year: 2018 },
        { id: 6, year: 2019 },
      ],      
    }
  },
  computed:{
    ...mapState({
      suburbs_raw: state => state.reports.suburbs,
      //current_projects: state => state.reports.current_projects,
      sub_sel: state => state.reports.selected_suburb,
      sub_over: state => state.reports.over_suburb,
      sub_sel_shape: state => state.reports.selected_suburb_shape,
      //townhall: state => state.reports.townhall,
      townhalls: state => state.reports.townhalls,
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
    height(){
      return this.$breakpoint.is.smAndDown ? 800 : 700
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
    },
    is_tooltip:{
      get(){
        return !!this.sub_sel_data
      },
      set(){
        //console.log("de dónde viene?")
        this.sub_sel_data = undefined
      }
    },
    sub_sel_text(){
      return this.sub_sel_shape ? "Cargando..." : "Colonia x"
    },
    sub_sel_color(){
      return this.sub_sel_data
        ? this.scale_color(this.scale_participation(this.sub_sel_data.participation))
        : null
    }
  },
  mounted(){
    //const features = topojson.feature(map_json, map_json.objects.MEX_adm1).features    
    this.mountedMap(1)
  },
  watch:{
    current_period(after){
      console.log(after)
      this.mountedMap(after)
    }
  },
  methods:{
    ...mapActions({
      getFinalProjects : 'reports/FETCH_FINAL_PROJECTS',
      getSuburb : 'reports/GET_SUBURB',
    }),
    mountedMap(period_id){
      this.getFinalProjects(period_id).then((proys)=>{
        d3.json("https://cdn-yeeko.s3-us-west-2.amazonaws.com/alcaldias.json")
          .then(topology => {
            //console.log(topology)
            this.limits_th = topojson.feature(topology, topology.objects.alcaldias)
            this.loaded_data=true
            this.build_map()
        })
      })
    },
    scale_color(val){
      return d3.scaleSequential([0, 1], d3.interpolateCool)(val)
    },
    scale_participation(val){
      return d3.scaleSqrt()
        .domain([0,.3])(val)      
    },
    scale_pob(val){
      return d3.scaleSqrt()
        .domain(this.domain_pob)
        .range([0.5, 6])(val)
    },
    url(x, y, z){
      return `https://api.mapbox.com/styles/v1/${this.map_style}/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=${this.access_token}`
    },
    zoomFromSelect(value){
      console.log(value)
      if (value){      
        let selec = d3.select(`#th_${value}`)
          .dispatch("click")
      }
      else{
        let selec = d3.select(`.circle_back`)
          .dispatch("click")
      }
      //console.log(selec)
      //document.getElementById('diagnosis').click();
    },
    build_map(){
      let that = {}
      var is_small = this.$breakpoint.is.smAndDown
      var vm = this

      const projection = d3.geoMercator()
          .scale(1 / (2 * Math.PI))
          .translate([0, 0]);
      
      var path =  d3.geoPath(projection)

      const fixedProjection = d3.geoMercator()
        .scale(1 / (2 * Math.PI))
        .translate([0, 0]);
        
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
      
      var divisor = 1


      const g = svg.append("g");

      var townhalls = g
        .selectAll(".clicklable")
        .data(vm.limits_th.features)
        .join("path")
          .attr("stroke", "#dabdbd")
          .attr("cursor", "pointer")
          .attr("fill", "grey")
          .attr("id", d=> `th_${d.properties.municipio}`)
          .attr("fill-opacity", 0)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .classed("clicklable", true)
          .on("click", click_in_th)
          .on("mouseover", mousevent)
          .on("mouseout", ()=>{
            prov_text
              .text(null)
            rect_container
              .attr('fill-opacity', 0)
          })

      g.append('circle')
          .attr("fill", 'transparent')
          .attr("r", 1)
          .classed("circle_back", true)
          .on("click", back_cdmx)

      function back_cdmx() {
        d3.select('.selected')
          .classed('selected', false)
        d3.event.stopPropagation();
        svg.call(
          zoom.transform,
          d3.zoomIdentity
            .translate(vm.width / 2, vm.height / 2)
            .scale(-vm.initial_scale)
            .translate(...fixedProjection(vm.initial_center))
            .scale(-1)
        );
      }

      function click_in_th(d) {
        //svg.call(zoom.scale(2) )
        //zoom.scaleBy(svg, 1.2)
        //return
        if (d){
          d3.select('.selected')
            .classed('selected', false)
          vm.zoom_townhall = parseInt(d.properties.municipio)
          //svg.selectAll(".selected")
            //.classed('selected', false)
          d3.select(this)
            .classed('selected', true)
        }
        console.log(d)
        let base_coords = d || vm.sub_sel_shape
        const [[x0, y0], [x1, y1]] = d3.geoBounds(base_coords);
        var base_scale = Math.max(x1 - x0, y1 - y0)
        var new_scale = (d ? 228000: 160000) / base_scale
        var center = [(x0 + x1) / 2, (y0 + y1) / 2]
        d3.event.stopPropagation();
        svg.call(
          zoom.transform,
          d3.zoomIdentity
            .translate(vm.width / 2, vm.height / 2)
            .scale(-new_scale)
            .translate(...fixedProjection(center))
            .scale(-1)
        );
      }

      function mousevent(d){
        prov_text
          .text(d.properties.nomgeo)
        rect_container
          .attr('fill-opacity', 0.4)
      }

      const g_sub_sel = svg.append("g");

      const sub_sel_path = g_sub_sel.append("path")
        .attr('opacity', 0.65)
        .on("mouseout", mouseOutSubPathSelected)
        .on("click", ()=> {
          click_in_th()
        })

      var request_canceled = undefined
      var last_id = undefined
      var click_on_sub_sel = undefined

      var suburb_circles = svg.append("g")
          .selectAll('.out_circle')
          .data(vm.suburbs_geo)
          .join("circle")
          .classed("out_circle", true)
          .attr('opacity', 0.65)
          .attr('fill', d=> 
            vm.scale_color(vm.scale_participation(d.participation)))
          .on("mouseover", mouseoverSub)
          .on("mouseout", d=>{
            if (!vm.sub_sel_shape){
              vm.sub_sel_data = undefined
              request_canceled = d.id
            }
          })
          .on("click", function(d){
            click_on_sub_sel = true
            mouseoverSub.bind(d, true)
          })

      function mouseoverSub(d, new_id){
        var select_circle = d3.select(this)
        //console.log(click_on_sub_sel)
        vm.posX = d3.event.clientX
        vm.posY = d3.event.clientY
        vm.sub_sel_data = d
        //if (!click_on_sub_sel){
          vm.getSuburb([d.id]).then(res=>{
            onSuccessData(res)
          })
        //}
        sub_sel_path
          .attr("fill", vm.sub_sel_color)
        if (click_on_sub_sel){
          click_in_th(d, true)
        }
        function onSuccessData(res){
          console.log("onSuccessData")
          const need_cancel = request_canceled == res.id
          request_canceled = undefined
          if (need_cancel) return
          d3.selectAll('.selected_circle')
            .classed('selected_circle', false)
          select_circle
            .classed('selected_circle', true)
          sub_sel_path
            .attr("d", path(vm.sub_sel_shape))
          const [[x0, y0], [x1, y1]] = path.bounds(vm.sub_sel_shape)
          vm.posY += (y1 - y0) / 2
        }
      }

      function mouseOutSubPathSelected(){
        console.log("mouseOutSubPathSelected")
          vm.sub_sel_data = undefined
          sub_sel_path.attr("d", null)
          d3.selectAll('.selected_circle')
            .classed('selected_circle', false)
      }

      svg
        .call(zoom)
        .call(zoom.transform, 
          d3.zoomIdentity
            .translate(vm.width / 2, vm.height / 2)
            .scale(-vm.initial_scale)
            .translate(...projection(vm.initial_center))
            .scale(-1));

      function zoomed(transform) {
        //console.log(transform)
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
          .attr('r', d=> divisor * vm.scale_pob(d.pob_2010));

        sub_sel_path
          .attr("d", null);

        townhalls.attr("d", path);
      }

      let prov_square = [180, 20]
      const g_container = svg.append("g")
          .attr('transform', `translate(0,${vm.height - prov_square[1]})`)

      let rect_container = g_container.append("rect")
          .attr("fill", "grey")
          .attr("fill-opacity", 0)
          .attr('height', d=> prov_square[1])
          .attr('width', d=> prov_square[0])
          
          
      let prov_text = g_container
          .append("text")
          .attr("id", "prov_tag")
          .attr("font-size", "1em")
          .attr('x', 6)
          .attr('y', `${prov_square[1]-4}`)
          .attr('opacity', 0.65)


      //width: 640,
      //height: 700,
      let width_legend = 200
      let height_leyend = 52
      let left_legend = 20

      svg.append("rect")
          .attr("fill", "white")
          .attr("fill-opacity", is_small ? 0 : .6)
          .attr('height', d=> height_leyend)
          .attr('width', d=> width_legend + 20)
          .attr('transform', `translate(${vm.width - width_legend - left_legend - 10}, ${14})`)

      vm.legend({
        color: d3.scaleSequentialSqrt([0,.3], vm.scale_color),
        title: "Nivel de Participación",
        ticks: 7,
        fontSize: is_small ? 14 : 9,
        //fontSize: 9,
        marginLeft: is_small ? 20 : vm.width - width_legend - left_legend,
        //marginLeft: vm.width - width_legend - left_legend,
        //marginTop: is_small ? 570 : 30,
        marginTop: 30,
        //height: is_small ? 615 : 65,
        height: 65,
        //width: is_small ? 400 : vm.width - left_legend,
        width: vm.width - left_legend,
      })


      let width_legend_bub = is_small ? 136 : 136
      let legend_bubbles = [vm.width - width_legend_bub -left_legend , 
        is_small ? 90 : 65]
      const leg_bub_container = svg.append("g")
          .attr('transform', `translate(${legend_bubbles[0]}, ${76})`)
          .attr("pointer-events", "none")

      let rect_leg_bub = leg_bub_container.append("rect")
          .attr("fill", "white")
          .attr("fill-opacity", .6)
          .attr('height', d=> legend_bubbles[1])
          .attr('width', d=> width_legend_bub)
          
      let legends_sizes = is_small 
        ? ["Tamaño según", "población"] 
        : ["Tamaño según población"]
      leg_bub_container
        .selectAll('.legend_bub_text')
        //.data(["menos pobl.", "más pobl."])
        .data(legends_sizes)
          .join("text")
            .classed("legend_bub_text", true)
            .attr("font-size", is_small ? "1em" : "0.7em")
            //.attr('x', (d, i)=> i ? width_legend_bub - 60 : 2)
            .attr('x', 2)
            .attr('y', (d, i)=> (i * 20) + 20)
            .attr("font-weight", "bold")
            .text(d=>d)
          
      let bubbles_examples = [8, 16, 24, 32]
      let examples_containers = leg_bub_container
        .selectAll('.legend_bubble')
          .data(bubbles_examples)
          .join("circle")
            .classed("legend_bubble", true)
            .attr('cx', (d, i)=> (20 * i) + (i ? (d * i/2.7) + 15 : 12))
            .attr('cy', legend_bubbles[1]-22)
            .attr('r', d=> d/2)
            .attr('fill', 'transparent')
            .attr('stroke', 'black')





      //that.back_cdmx = back_cdmx
      //return that

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
            :items="periods"
            v-model="current_period"
            label="Año"
            :class="{'float-right': $breakpoint.is.smAndUp}"
            class="ml-2"
            item-text="year"
            item-value="id"
            outlined
            style="max-width: 100px;"
            @change="zoomFromSelect"
          ></v-select>
          <v-select
            :items="townhalls"
            v-model="zoom_townhall"
            label="Selecciona una Alcaldía"
            :class="{'float-right': $breakpoint.is.smAndUp}"
            item-text="name"
            item-value="cve_alc"
            outlined
            clearable
            style="max-width: 250px;"
            @change="zoomFromSelect"
          ></v-select>
          <br>
          <span class="grey--text">
            Interactúa con el mapa y sus elementos
          </span>
        </div>
        <svg id="MapCDMX">
        </svg>
        
        <v-tooltip 
          v-if="true"
          :color="sub_sel_color"
          bottom 
          v-model="is_tooltip"
          :position-x="posX"
          :position-y="posY"
        >
          <div
            class="pa-3"
          >
            <span v-if="sub_sel_data">
              {{sub_sel_data.name}}
              ({{sub_sel_data.townhall_obj.name}})
              <br>
              <span>{{format_perc(sub_sel_data.participation*100)}}% de participación</span>
              <br>
            </span>
            <v-progress-circular
              v-if="!sub_sel_shape || !sub_over"
              scolor="purple"
              size="18"
              indeterminate>
            </v-progress-circular>
            <span v-else>{{format_thous(sub_over.pob_2010)}} Habitantes</span>
          </div>
        </v-tooltip>
      </v-card>
    </v-col>
  </v-row>
</template>

<style lang="scss">
.selected {
  fill-opacity: 0.1;
}
.selected_circle {
  fill-opacity: 0;
  stroke: black;
  stroke-width: 1;
  pointer-events: none;
}
</style>