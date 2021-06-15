<script>
import ppMixin from "~/mixins/ppMixin";
import { mapState, mapActions } from "vuex";
import * as d3 from 'd3';
import * as d3Array from 'd3-array';

export default {
  name: 'Viz',
  mixins: [ppMixin],
  data(){
    return {
      width: 640,
      height: 740,
      is_tooltip: false,
      posX: -200,
      posY: -200,
      tt_data: undefined,      
      paddings: { left: 50, right: 200, top: 140, bottom: 10 },
      squares: { height: 32, width: 44, padding_x: 0.12, padding_y: 0.08 },
      built: false,
      ammounts : [
        { name: 'executed_mean', color: '#700174', text: 'ejecutado'},
        { name: 'approved_mean', color: '#00bcd4', text: 'aprobado' }
      ],
      not_fields: ["not_approved", "not_executed", "not_reported"],
      periods:[
        { id: 0, year: 'mean' },
        { id: 3, year: 2014 },
        { id: 4, year: 2015 },
        { id: 5, year: 2016 },
        { id: 2, year: 2017 },
        { id: 1, year: 2018 },
        { id: 6, year: 2019 },
      ],
      columns:[
        {name: 'every_not', text: 'no ejecutado', color: '#d73027a0'},
        {name: 'minus_10', text: 'menor a 90%', color: '#fdae6190'},
        {name: 'minus_5', text: '90% - 97.5%', color: '#fee08b90'},
        {name: 'similar', text: 'similiar', color: '#b4b4b438'},
        {name: 'plus_5', text: 'más de 102.5%', color: '#d9ef8b99'},
      ],
      mean_th: {id: 0, name: 'Promedio', short_name: 'mean'},
      legend: { width: 70, height: 15 },
    }
  },
  computed:{
    ...mapState({
      hered_townhalls: state => state.reports.townhalls,
      public_accounts: state => state.reports.data_viz,
    }),
    townhalls: (vm) =>  [...[vm.mean_th], ...vm.hered_townhalls],
    column_names: (vm) => vm.names(vm.columns),
    ammount_names: (vm) => vm.names(vm.ammounts),
    all_pa: (vm) => vm.public_accounts.map(pa=>{
      let every_not = vm.not_fields.reduce((tot, field)=> tot+=pa[field], 0)
      return {...pa, ...{every_not: every_not}}
    }),
    all_th(){
      let fields_base = ['townhall', 'period_pp']
      let meansByCat = (arr, curr_field) =>
        Array.from(d3Array.group(arr, d=>d[curr_field]), ([key, value]) => {
          let final_data = fields_base.reduce((dicc, field)=>(
            { ...dicc, ...{[field]: (field == curr_field) ? key : 0} } ),{})
          let redu = (coll, oper) => 
            coll.forEach(fld=> final_data[fld] = d3[oper](value, d => d[fld]))
          redu(this.ammount_names, 'mean')
          redu(this.column_names, 'sum')
          return final_data          
        })
      return fields_base.reduce((tot, field)=>(
        [ ...tot, ...meansByCat(tot, field) ]
      ), this.all_pa.filter(pa=> !pa.no_info) )
    },
    grouped_years_arr: (vm) =>
      Array.from(d3Array.group(vm.all_th, d=>d.period_pp), ([key, value]) =>
        Object.assign(value, { period_pp: key }) ),
    max_th: (vm) => d3Array.rollup(vm.all_th,
        v => d3.max(v, d => d3.max(vm.ammount_names.map(amm=>d[amm]))) * 1.1,
        d => d.townhall) ,
    hydrated_tt(){
      if (!this.tt_data)
        return null
      let final_obj = {}
      final_obj.townhall_obj = this.townhalls.find(th=> 
        th.id == this.tt_data.townhall)
      final_obj.period_obj = this.periods.find(period=> 
        period.id == this.tt_data.period_pp)
      final_obj.values = this.columns.map( col =>
        ({...col, ...{value: this.tt_data[col.name] || 0}}) )
        //`${col.text}: ${this.tt_data[col.name] || 0}` )
      final_obj.ammounts = this.ammounts.map( amm =>
        `${amm.text}: ${d3.format("($,.2f")(this.tt_data[amm.name])}` )

      return final_obj
    },
  },
  created(){
    this.fetchCatalogs().then(cats=>{
      this.build_map()
    })
    this.fetchDataViz().then(res=>{
      this.build_map()
    })
  },
  methods: {
    ...mapActions({
      fetchCatalogs : 'reports/FETCH_CATALOGS',
      fetchDataViz : 'reports/FETCH_DATA_VIZ',
    }),
    names: (arr) => arr.map(el=>el.name),
    formatAmmount(val){
      if (isNaN(val))
        return "-"
      else
        return d3.format("($,.2f")(val)
    },
    series(data_year){
      return d3.stack()
        .keys(this.column_names)
        .offset(d3.stackOffsetExpand)
      (data_year)
        .map(d => (d.forEach(v => v.key = d.key), d))
    },
    build_map(){
      var vm = this

      console.log(vm.all_th)
      console.log(vm.grouped_years_arr)

      if (!vm.public_accounts || !vm.hered_townhalls || vm.built)
        return
      this.built = true
      let sq_paddings = { x: vm.squares.height * vm.squares.padding_y,
        y: vm.squares.width * vm.squares.padding_x }

      let len_th = vm.townhalls.length + 1
      let base_height = ((len_th + 1) * vm.squares.height)
        + ((len_th + 2 ) * sq_paddings.y)
      let height = base_height + vm.paddings.top + vm.paddings.bottom
      console.log(height)
      const svg = d3.select('#DataViz')
          .attr("viewBox", [0, 0, vm.width, height]);

      var xColScale = d3.scaleBand()
          .domain( vm.periods.map(d => d.id))
          .range([vm.paddings.left, vm.width - vm.paddings.right])
          .padding(vm.squares.padding_x)
      let x_cols = (val) => xColScale(val) + (val ? 10 : 0)

      var x = d3.scaleLinear()
          .range([ 0, vm.squares.width ])
      
      var yScale = d3.scaleBand()
        .domain(vm.townhalls.map(th => th.id))
        .range([vm.paddings.top, height - vm.paddings.bottom])
        .padding(vm.squares.padding_y)
      var y = (val) => yScale(val) + (val ? (sq_paddings.y * 2) : 0)

      var dinamic_y = d3.scaleLinear()
        .range([vm.squares.height, 0])

      let years = svg.append("g")
        .selectAll("g")
        .data(vm.grouped_years_arr)
        .join('g')
          .attr('transform', (d, i)=> `translate(${x_cols(d.period_pp)},0)`)

      years
        .append('text')
          .attr('y', vm.paddings.top)
          .text(d => vm.periods.find(per=> per.id == d.period_pp).year )

      let row_texts = svg.append("g")
        .selectAll("text_container")
        .data(vm.townhalls)
        .join('g')
          .attr('class', 'text_container')
          //.attr('y', d=> y(d.id))
          .attr('transform', d=> `translate(3, ${y(d.id)})`)

      row_texts
        .append('text')
          .text(d=> d.short_name)
          .attr('dominant-baseline', 'middle')
          .attr('transform', d=> `translate(0, ${vm.squares.height / 2})`)

      row_texts
        .append('text')
          .filter(d=> !!d.id)
          .text(d=> d3.format('.3s')(vm.max_th.get(d.id)) )
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'end')
          .attr('transform', (d, i) => 
            `translate(${vm.paddings.left - 3}, 0)`)
          .attr('font-size', '7px')

      row_texts
        .append('path')
          .filter(d=> !!d.id)
          .attr("d", ()=>{
            let h = yScale.bandwidth()
            return `M 0 -0.5 4 -0.5 4 ${h} 3 ${h} 3 .5 0 .5 Z`
          })
          .style("stroke-width", 1)
          .attr('transform', (d, i) => 
            `translate(${vm.paddings.left - 1}, 0)`)          
          //.attr("fill", (d, i) => d3.schemeCategory10[i+2])
          //.attr("transform", d => `translate(${d.x - 20}, ${d.y - 40})`)

      let range_color = years
        .selectAll("g")
        .data(d => vm.series(d))
        .join("g")
          .attr("fill", d => vm.columns.find(col=>col.name == d.key).color)

      range_color
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", d => x(d[0]))
          .attr("y", (d, i) => y(d.data.townhall) )
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("height", yScale.bandwidth())






      var townhalls = years
        .selectAll(".clicklable")
        .data(d => d)
        .join("g")
          .filter(d => !!d.townhall)
          .attr('transform', (d, i)=> `translate(0,${y(d.townhall)})`)
          .each( function(p, j){
            dinamic_y.domain([0, vm.max_th.get(p.townhall)])
            let amms = vm.ammounts.map(amm=> (
              { ...amm, ...{ y: dinamic_y(p[amm.name])} } ) )
            let extent = amms.sort((a, b)=> b.y - a.y)

            var common_rects = (sel) => sel
                .attr('x', 0)
                .attr('width', vm.squares.width)
                .attr("stroke-width", 0)

            d3.select(this)
              .append("rect")
                .call(common_rects)
                .attr("fill", `${extent[0].color}40`)
                .attr('y', extent[1].y )
                .attr('height', extent[0].y - extent[1].y)

            d3.select(this)
              .append("rect")
                .call(common_rects)
                .attr("fill", "transparent")
                .attr('y', 0)
                .attr('height', vm.squares.height)
                .attr('class', 'simple')
                .on("mousemove", function(d) {
                  vm.is_tooltip = true
                  vm.posX = d3.event.clientX
                  vm.posY = d3.event.clientY
                })
                .on("mouseover", function(d) {
                  vm.is_tooltip = true
                  let parent = d3.select(this.parentNode).datum()
                  vm.tt_data = parent
                  /*var h = d.parent.children.find(x=>x.data.sex == 'hombre').value
                  var m = d.parent.children.find(x=>x.data.sex == 'mujer').value
                  vm.tt_data = {
                    segmento : d.data.segmento,
                    nombre : d.data.segmento.nombre,
                    description : d.data.segmento.descripcion,
                    total_segmento : d.parent.value,
                    h: h,
                    m: m,
                    perc: m/(h+m),
                    seg: vm.format_perc(d.parent.value *100 / d.parent.parent.value),
                    seg_tot: d3.format(",")(d.parent.value),
                    g_seg_name: gs.grupo_segmento.nombre,
                  }*/
                })
                .on("mouseout", function(d) {
                  vm.is_tooltip = false
                })





            d3.select(this)
              .selectAll('.draws')
              .data(amms)
              .join("rect")
                .call(common_rects)
                .attr("fill", q => q.color)
                .attr('y', q => q.y)
                .attr('height', 1.2)
                .attr('class', 'draws')


            /*d3.select(this)
              .append("text")
                .filter(d=> d.period_pp)
                .attr('y', yScale.bandwidth()-4)
                .attr('x', vm.squares.width)
                .attr("alignment-baseline", "hanging")
                .attr("font-size", "7px")
                .attr('text-anchor', 'end')
                .text(d=> vm.column_names.reduce((tot, col)=> tot+= d[col], 0))*/
          })

      svg
        .append("text")
          .attr("y", 0)
          .attr("alignment-baseline", "hanging")
          .attr("font-size", "14px")
          .style("text-anchor", "start")
          .text('Proyectos según proporción entre el monto ejecutado y el asignado')

      svg.selectAll("mylabels")
        .data(vm.columns)
        .enter()
        .append("text")
          .attr("x", (d, i) => (i + 0.5) * vm.legend.width )
          .attr("y", 20)
          .style("fill", d=>  d.color.substr(0,7))
          .attr("alignment-baseline", "hanging")
          .attr("font-size", "11px")
          .style("text-anchor", "middle")
          .text(d=> d.text)

      svg.selectAll("mydots")
        .data(vm.columns)
        .enter()
        .append("rect")
          .attr("x", (d, i)=> i*(vm.legend.width))
          .attr("y", 34)
          .attr("width", vm.legend.width)
          .attr("height", vm.legend.height)
          .style("fill", d => d.color)
      
      let leg_amm = svg.append("g")

      svg
        .append("text")
          .attr("y", 70)
          .attr("alignment-baseline", "hanging")
          .attr("font-size", "14px")
          .style("text-anchor", "start")
          .text('Promedio de montos por Alcaldía')


      leg_amm
        .selectAll("legend_vert")
        .data(vm.ammounts.reverse())
        .enter()
        .append("rect")
          .attr("x", (d, i)=> i*(vm.legend.width * 2.5))
          .attr("y", 100)
          .attr("width", vm.legend.width / 2)
          .attr("height", 2)
          .style("fill", d => d.color)

      leg_amm
        .selectAll("text_vert")
        .data(vm.ammounts)
        .enter()
        .append("text")
          .attr("x", (d, i)=> (vm.legend.width / 2) + 5 + i*(vm.legend.width * 2.5))
          .attr("y", 100)
          .style("fill", d => d.color)
          .attr("alignment-baseline", "middle")
          .attr("font-size", "13px")
          .text(d=> d.text)

    },
  },  
}
</script>

<template>
  <v-card id="viz" class="ma-2 px-4 text-center">
    <v-icon class="mt-4" large>fa-chart-bar</v-icon> 
    <v-card-text class="text-subtitle-1">
      <svg id="DataViz">
      </svg>
    </v-card-text>

    <v-tooltip 
      color="white"
      bottom 
      class="black--text"
      v-model="is_tooltip"
      :position-x="posX"
      :position-y="posY"
    >
      <div
        v-if="tt_data"
        class="pa-3 black--text"
        _style="{'border': `2px ${calcHeatColor(tt_data.perc)} solid`}"
      >
        <span>{{hydrated_tt.townhall_obj.name_upper}}</span>
        <span>{{hydrated_tt.period_obj.year}}</span>
        <div>Colonias según variación:</div>
        <div v-for="value in hydrated_tt.values">
          <v-icon :color="value.color">fa-square-full</v-icon>
          {{value.text}}: {{value.value}}
        </div>
        <div>Promedios:</div>
        <div v-for="amm in hydrated_tt.ammounts">
          {{amm}}
        </div>
      </div>      
    </v-tooltip>

  </v-card>
</template>