<script>
import AutoComplete from "~/components/common/AutoComplete";
import MapCDMX from "~/components/map/MapCDMX";
import MainHeader from "~/components/home/MainHeader";
import ppMixin from "~/mixins/ppMixin";
import { mapState, mapActions } from "vuex";
import * as d3 from 'd3';
import * as d3Array from 'd3-array';

export default {
  name: 'Viz',
  components: { AutoComplete, MapCDMX, MainHeader},
  mixins: [ppMixin],
  data(){
    return {
      informer_type: '',
      want_add: false,
      is_mounted: false,
      suburb: undefined,
      show_map: false,
      width: 640,
      height: 740,
      suburbs_arr: undefined,
      complete_arr: undefined,
      built: false,
      periods:[
        { id: 3, year: 2014 },
        { id: 4, year: 2015 },
        { id: 5, year: 2016 },
        { id: 2, year: 2017 },
        { id: 1, year: 2018 },
        { id: 6, year: 2019 },
      ],
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
      townhalls: state => state.reports.townhalls,
      categories: state => state.reports.categories,
      suburb_types: state => state.reports.suburb_types,
      selected_suburb: state => state.reports.selected_suburb,
      suburb_id: state => state.reports.suburb_id,
      data_viz: state => state.reports.data_viz,
    }),
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
    }
  },
  watch:{
    townhalls(after){
      if (after && this.data_viz && !this.built)
        this.build_map()
    },
    data_viz(after){
      if (after && this.townhalls && !this.built)
        this.build_map()
    },
  },
  created(){
    this.fetchCatalogs().then(cats=>{
      this.show_map = true
    })
    this.fetchDataViz().then(res=>{
      console.log("hola")
      this.show_map = true
    })
  },
  mounted(){
    this.is_mounted = true
  },
  methods: {
    ...mapActions({
      fetchCatalogs : 'reports/FETCH_CATALOGS',
      fetchDataViz : 'reports/FETCH_DATA_VIZ',
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
    build_map(){

      var vm = this

      this.built = true
      let columns = [
        'not_executed',
        'minus_10',
        'minus_5',
        //'no_info',
        'similar',
        'plus_5',
      ]

      let grouped_years = d3Array.group(vm.data_viz, 
        d => vm.periods.find(period=> period.id ==d.period_pp).year)

      console.log(grouped_years)

      let max_th = d3Array.rollup(vm.data_viz,
        v=> d3.max(v, d => Math.max(d.executed_mean, d.approved_mean))*1.1, 
        d => d.townhall)
      console.log(max_th)

      let series = function(data_year){
        return d3.stack()
          .keys(columns)
          .offset(d3.stackOffsetExpand)
        (data_year)
          .map(d => (d.forEach(v => v.key = d.key), d))
      }

      const svg = d3.select('#DataViz')
          .attr("viewBox", [0, 0, vm.width, vm.height]);

      var x_cols = d3.scaleBand()
          .domain(vm.periods.map(d => d.year))
          .range([50, vm.width - 200])
          .padding(0.08)

      var x = d3.scaleLinear()
          .range([0, 44])
      
      var y = d3.scaleBand()
        .domain(vm.townhalls.map(d => d.id))
        .range([60, vm.height - 10])
        .padding(0.12)

      var dinamic_y = d3.scaleLinear()
        .range([30, 0])

      let colors_x = ['#d7302786', "#fdae61B3", '#fee08bA3', '#f7f7f7', '#abdda4BF']
      //["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]
      var color = d3.scaleOrdinal()
          .domain(columns)
          .range(d3.schemeSpectral[columns.length])
          .unknown("#ccc")

      //console.log(grouped_years.get(2018))
      //console.log(series(grouped_years.get(2018)))

      let grouped_years_arr = Array.from(grouped_years, ([key, value]) =>
        Object.assign(value, { year: key }) )

      let years = svg.append("g")
        .selectAll("g")
        .data(grouped_years_arr)
        .join('g')
          //.attr('x', d => x_cols(d.year))
          .attr('transform', (d, i)=> `translate(${x_cols(d.year)},0)`)
            /*.append('text')
            .attr('x', x_cols(d.year))
            .attr('y', 20)
            .text(d => d.year)*/

      years
        .append('text')
          //.attr('x', 70)//d=> x_cols(d.year))
          .attr('y', 50)
          .text(d => d.year)

      let row_texts = svg.append("g")
        .selectAll("text")
        .data(vm.townhalls)
        .join('text')
          .text(d=> d.short_name)
          .attr('dominant-baseline', 'central')
          //.attr('x', d => x_cols(d.year))
          .attr('transform', (d, i)=> `translate(3, ${y(d.id) + 15})`)



      let range_color = years
        .selectAll("g")
        .data(d => series(d))
        .join("g")
          //.attr("fill", d => color(d.key))
          .attr("fill", (d, i) => colors_x[i])

      range_color
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", d => x(d[0]))
          .attr("y", (d, i) => y(d.data.townhall))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("height", y.bandwidth())
          //.append("title")
            //.text(d => `${d.data.name} ${d.key}
      //${formatPercent(d[1] - d[0])} (${formatValue(d.data[d.key])})`);

      //const g = svg.append("g");

      let ammounts = ['executed_mean', 'approved_mean',]
      let colors_y = ['#700174', '#00bcd4']
      let colors_y2 = ['#70017440', '#00bcd440']

      var townhalls = years
        .selectAll(".clicklable")
        .data(d => d)
        .join("g")
          //.attr("fill", "grey")
          //.attr("y", (d, i) => y(d.townhall))
          .attr('transform', (d, i)=> `translate(0,${y(d.townhall)})`)
          .attr("stroke", "grey")
          //.call()
          /*.call(alg => {
            console.log(alg)
          })*/
          .each( function(p, j){
            let exec = p.executed_mean
            let appr = p.approved_mean
            let extent = d3.extent([exec, appr])
            dinamic_y.domain([0, max_th.get(p.townhall)])
            d3.select(this)
              .append("rect")
                .attr("fill", colors_y2[exec > appr ? 1 : 0])
                .attr('x', 0)
                .attr('y', dinamic_y(extent[1]) )
                .attr('height', dinamic_y(extent[0]) - dinamic_y(extent[1]))
                .attr('width', 44)
                .attr("stroke-width", 0)


          })

      var func_ej2 = (sel) => sel
        .style('fill', d=> vm[`color_${d.sex.substr(0,1)}`])
        .attr("text-anchor", d => d.sex == 'mujer' ? "start" : "end")


      let means = townhalls
        .selectAll('#draws')
        .data(ammounts)
        .join("rect")
        //.append("rect")
          .attr("fill", (d, i) => colors_y[i])
          .attr('x', 0)
          .attr('y', function(d, i){
            let datum = d3.select(this.parentNode).datum()
            let curr_max = max_th.get(datum.townhall)
            let variation = datum[d]/curr_max
            dinamic_y.domain([0, curr_max])
            return dinamic_y(datum[d]) //+ y(datum.townhall)
          })
          .attr('height', 1.2)
          .attr('width', 44)
          .attr("id", 'draws')
          .attr("stroke-width", 0)


    },
  },  
}
</script>

<template>
  <div style="width: 100%">
    <v-card id="viz" class="ma-2 px-4 text-center">
        <v-icon class="mt-4" large>fa-chart-bar</v-icon> 
      <v-card-text class="text-subtitle-1">
        <svg id="DataViz">
        </svg>
      </v-card-text>
    </v-card>
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