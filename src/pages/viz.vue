<script>
import AutoComplete from "~/components/common/AutoComplete";
import MapCDMX from "~/components/map/MapCDMX";
import MainHeader from "~/components/home/MainHeader";
import ppMixin from "~/mixins/ppMixin";
import { mapState, mapActions } from "vuex";
import * as d3 from 'd3';

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
      height: 640,
      suburbs_arr: undefined,
      complete_arr: undefined,
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
      if (after)
        this.build_map()

    }
  },
  created(){
    this.fetchCatalogs().then(cats=>{
      this.show_map = true
    })
  },
  mounted(){
    this.is_mounted = true
  },
  methods: {
    ...mapActions({
      fetchCatalogs : 'reports/FETCH_CATALOGS',
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
      let columns = [
          'one',
          'two',
          'three',
          'four',
      ]
      let base_api = this.townhalls.map(th=>{
        return {
          town_hall: th.id,
          mean_assigned: (Math.random() * 10) + 80,
          mean_executed: (Math.random() * 10) + 77,
          one: Math.random() * 18,
          two: Math.random() * 50,
          three: Math.random() * 123,
          four: Math.random() * 5,
        }
      })
      console.log(base_api)

      /*let base_table = this.base_api.map(th=>{
        let vars = { town_hall: th.town_hall }
        columns.forEach(col=>  vars[col] = th.distributed[col] )
        return vars
      })*/
      let series = d3.stack()
          .keys(columns)
          .offset(d3.stackOffsetExpand)
        (base_api)
          .map(d => (d.forEach(v => v.key = d.key), d))
      console.log(series)



      let that = {}
      var is_small = this.$breakpoint.is.smAndDown
      var vm = this

      const svg = d3.select('#DataViz')
          //.attr("viewBox", [-20, 0, this.width+40 , this.height])
          .attr("viewBox", [0, 0, vm.width, vm.height]);

      var x = d3.scaleLinear()
          //.range([margin.left, width - margin.right])
          .range([70, 70 + 40])
      
      console.log(base_api.map(d => d.town_hall))
      var y = d3.scaleBand()
        //.domain(columns)
        .domain(base_api.map(d => d.town_hall))
        //.range([margin.top, height - margin.bottom])
        .range([0, vm.height - 0])
        .padding(0.12)
      let colors_x = ['#d7302786', '#fee08bA3', '#f7f7f7', '#abdda4BF']

      var color = d3.scaleOrdinal()
          .domain(series.map(d => d.key))
          .range(d3.schemeSpectral[series.length])
          .unknown("#ccc")

      let range_color =  svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
          //.attr("fill", d => color(d.key))
          .attr("fill", (d, i) => colors_x[i])

      range_color
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", d => x(d[0]))
          .attr("y", (d, i) => y(d.data.town_hall))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("height", y.bandwidth())
          //.append("title")
            //.text(d => `${d.data.name} ${d.key}
      //${formatPercent(d[1] - d[0])} (${formatValue(d.data[d.key])})`);

      //const g = svg.append("g");

      let ammounts = [80, 76]
      let colors_y = ['#00bcd480', '#70017480']


      var townhalls = svg
        .selectAll(".clicklable")
        .data(base_api)
        .join("g")
          //.attr("fill", "grey")
          .attr("y", (d, i) => y(d.town_hall))
          .attr('transform', (d, i)=> `translate(70,${y(d.town_hall)})`)
          .attr("stroke", "grey")

      /*townhalls
        .append("rect")
        //.attr("fill", "#bfbfbf")
        .attr("width", 40)
        .attr("height", y.bandwidth())*/


      let assigned = townhalls
        //.selectAll('#draws')
        //.data(ammounts)
        //.join("rect")
        .append("rect")
          .attr("fill", (d,i) => colors_y[0])
          .attr('x', 0)
          .attr('y', d => 32- ( (d.mean_assigned / 100) * 32))
          .attr('height', 2)
          .attr('width', 40)
          .attr("id", 'draws')
          .attr("stroke-width", 0)
          //.attr('transform', (d, i)=> `translate(50,${i*32})`)
          //.attr("stroke", "grey")

      let executed = townhalls
        //.selectAll('#draws')
        //.data(ammounts)
        //.join("rect")
        .append("rect")
          .attr("fill", (d,i) => colors_y[1])
          .attr('x', 0)
          .attr('y', d => 32- ((d.mean_executed / 100) * 32))
          .attr('height', 2)
          .attr('width', 40)
          .attr("id", 'draws')
          .attr("stroke-width", 0)
          //.attr('transform', (d, i)=> `translate(50,${i*32})`)
          //.attr("stroke", "grey")

      
      /*let approved = townhalls
        .append("rect")
        //.attr("fill", "#bfbfbf")
        .attr("width", 40)
        .attr("height", 32)

      let executed = townhalls
        .append("rect")
        //.attr("fill", "#bfbfbf")
        .attr("width", 40)
        .attr("height", 32)*/



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