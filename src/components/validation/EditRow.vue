<script>

import * as d3 from 'd3';
import { mapActions } from "vuex";

export default {
  name: 'EditRow',
  props:{
    url: { type: String, required: false },
    rows: { type: Array, required: false },
    image_refs: { type: Object, required: false },
    current_row: { type: Object, required: true },
    current_image: { type: Object, required: false },
  },
  data () {
    return {
      width: 2200,
      height: 1700,
      loading: true,
      fp_data: {},
      rules: {
        defined_n: v => v != undefined && v !="" || 'Escribe la respuesta',
      },      
      number_cols: [
        { text: 'Avance', field: 'progress',  is_perc: true, idx: 3},
        { text: 'Aprobado', field: 'approved', idx: 4 },
        { text: 'Modificado', field: 'modified', idx: 5 },
        { text: 'Ejecutado', field: 'executed', idx: 6  },
        { text: 'Variación', field: 'variation', is_perc: true, idx: 7 },
      ],
      large_texts: [
        { text: 'Colonia', field: 'suburb', cols: 3, idx: 0 },
        { text: 'Proyecto', field: 'project_name', cols: 4, idx: 1},
        { text: 'Descripción', field: 'description', cols: 5, idx: 2},
      ],
    }
  },
  computed:{
    available_ammounts(){
      let ammounts = this.number_cols.filter(num=> !num.is_perc)
      return ammounts.reduce((tot, num)=> {
        let curr_num = parseFloat(this.fp_data[num.field])
        return (!curr_num || tot.includes(curr_num))
          ? tot
          : [...tot, curr_num]
      },[0])
    },
    custom_remain(){
      let f_ps = this.current_image ? this.current_image.final_projects : []
      let fp_matched = f_ps.filter(fp=> fp.rows_count)
        .slice().sort((a,b)=> d3.descending(a.rows_count, b.rows_count))
      let fp_orphans = f_ps.filter(fp=> !fp.rows_count)
      let empty = { id: null, suburb_name: 'NINGUNA COLONIA'}
      return [empty, ...fp_orphans, ...fp_matched]
    },
    selectedSuburb(){
      try{
        return this.custom_remain.find(sub=>
          sub.id == this.fp_data.final_project).suburb_cve_col
      }catch(err){
        return " ------ "
      }
    },
    errors(){
      if (!this.current_row.errors) return []
      let columns = []
      return this.current_row.errors.reduce((arr, err)=>{
        let col_text = err.substr(err.indexOf("columna"), 18)
        if (!columns.includes(col_text) && !err.includes('Value')){
          columns.push(col_text)
          return [...arr, err]
        }
        return arr
      },[])
    }
  },
  watch:{
    current_row(after, before){
      if (!after.id){
        this.fp_data = {}
        return
      }
      let need_change = !before.id
      if (before.id && after.id)
        need_change = before.id !== after.id
      if (need_change)
        this.updateSelected(after)
    }
  },
  methods:{
    ...mapActions({ putRow : 'reports/PUT_ROW' }),
    format(num){
      return d3.format(',')(num)
    },
    colorStart(row){
      let color = d3.scaleSequential(d3.interpolateTurbo)
        .domain([1.3,0.7])
      let simil = row.similar_suburb_name
      return !row.final_project
        ? "#F44336" // red
        : row.double_row
          ? '#9C27B0' //deep-purple
          : simil == 0
            ? '#009688' //teal
            : color(simil)
          //? '#E91E63' //pink
          //: simil == 0
            //? '#9C27B0' //deep-purple
    },
    updateSelected(row){
      let vm = this
      console.log(row)
      this.fp_data = {...{}, ...row}

      let divs = this.image_refs.divs
      let y0 = row.top - 10
      let y1 = row.bottom - row.top + 20
      
      let buildViewBox = (ref) => (
        [ divs[ref.idx0] - 20, y0, divs[ref.idx1] - divs[ref.idx0] + 40, y1])

      let images_to_build = [
        { idx0: 0, idx1: 3, fields: this.large_texts },
        { idx0: 3, idx1: 8, fields: this.number_cols },
      ]

      var svg_main = d3.select("#imageback")
      let squares = svg_main
        .selectAll("rect#rect-color")
        .attr("stroke-width", d=> {
          if (d.id == row.id)
            return "4"
          else
            return "0.5"
        })
        .attr("stroke", d=> {
          if (d.id == row.id)
            return "#F44336"
          else
            return "#304FFE"
        })

      var svg_images = d3.selectAll(".selected-image")
        .data(images_to_build)
          .join()
          .attr("viewBox", d=> buildViewBox(d))
      
      svg_images.selectAll("#back_image2")
        .data([vm.url])
        .join("image")
          .attr('xlink:href', d=> d)
          .attr('width', vm.width)
          .attr('id', 'back_image2')

      let square1 = svg_images
        .selectAll("rect")
        .data(d=>d.fields)
          .join("rect")
            .each(function(p, j){
              let parent = d3.select(this.parentNode).datum()
              let curr_idx = parent.idx0 + j 
              d3.select(this)
                .style("width", divs[curr_idx + 1 ] - divs[curr_idx] - 4)
                .attr("transform", `translate(${divs[curr_idx] - 2},${row.top})`)
                .attr("fill", (d)=> {
                  if (parent.idx0 && (row.final_project))
                    if (row.errors.some(err=> err.includes(p.text)))
                      return '#FFC107' //amber
                  if (p.idx)
                    return '#8BC34A' //ligth-green
                  else if (row.final_project_obj){
                    return vm.colorStart(row)
                  }
                  return row.color
                })
            })
            .style("height", row.bottom - row.top)
            .attr("opacity", 0.15)

      this.$nextTick(()=>{
        this.$vuetify.goTo("#bottom_page2",
          {duration: 600, offset: 30, easing:'easeInOutCubic'})
      })
    },
    saveRow(valid, show_next=false){
      this.fp_data.validated = valid
      this.loading = true
      this.putRow(this.fp_data).then(res=>{
        if (!show_next)
          this.$vuetify.goTo(0,
            {duration: 400, offset: 20, easing:'easeInOutCubic'})
        this.loading = false
        this.$emit('reset-image', [this.current_image.image.id, show_next])
      })
    },    
    addSpace(orient){
      let up = orient == 'up'
      var svg_images = d3.selectAll(".selected-image")
      svg_images
        .attr("viewBox", function(d){
          try{
            let current_vb =  d3.select(this).attr("viewBox").split(',')
            current_vb[1] = parseInt(current_vb[1]) - (up ? 50 : 0 )
            current_vb[3] = parseInt(current_vb[3]) + 50
            return current_vb
          }catch(err){
            console.log(err)
          }
        })
    },
    addText(orient, field){
      const suma = orient == 'up' ? 1 : -1
      const ref_idx = this.current_row[`idx_${orient}`]
      if (!this.rows[ref_idx])
        return
      const table_data = this.rows[ref_idx].formatted_data
      if (!table_data.length)
        table_data = this.rows[ref_idx].vision_data
      this.large_texts.forEach(txt=>{
        if (txt.idx){
          this.fp_data[txt.field] = suma == 1
            ? `${this.fp_data[txt.field]} ${table_data[txt.idx]}`
            : `${table_data[txt.idx]} ${this.fp_data[txt.field]}` 
        }
      })
      this.$emit('update-idx',([`idx_${orient}`, suma]))
      //this.current_row[`idx_${orient}`] += suma
    },
  },
}
</script>

<template>
  <v-row>
    <v-col v-for="error in errors" cols="6">
      <v-alert 
        :type="error.includes('columna') && !error.includes('anormal')
          ? 'error' : 'warning'"
        class="mx-3"
      >{{error}}</v-alert>
    </v-col>
    <v-col cols="12">
      <svg class="selected-image"></svg>
      <div class="float-left mt-n7 ml-10">
        <v-btn
          v-for="orient in ['up','down']"
          color="primary"
          icon
          class="ml-4"
          @click="addSpace(orient)"
        >
          <v-icon>{{`fa-chevron-${orient}`}}</v-icon>
        </v-btn>        
      </div>
    </v-col>
    <v-col
      v-for="lt in large_texts"
      :cols="lt.cols" 
      :key="lt.field"
    >
      <template v-if="lt.field == 'suburb'">
        <v-select
          :items="custom_remain"
          v-model="fp_data.final_project"
          item-value="id"
          item-text="suburb_name"
          outlined
          label="Colonia coincidente"
        >
          <template v-slot:item="{ item }">
            <b>{{item.rows_count}}</b>
            <v-icon 
              v-if="item.rows_count !== 1"
              color="warning"
            >fa-exclamation</v-icon>
            <span class="mx-2">{{item.suburb_name}}</span>
            <span class="grey--text">({{item.suburb_cve_col}})</span>
          </template>
          <template v-slot:selection="{ item }">
            <span v-if="item.rows_count !== 1" class="mr-2">
              <b>{{item.rows_count}}</b>
              <v-icon 
                color="warning"
              >fa-exclamation</v-icon>
            </span>
            <span>{{item.suburb_name}}</span>
          </template>
        </v-select>
        {{selectedSuburb}}
      </template>
      <template v-else>
        <v-textarea 
          :label="lt.text"
          outlined
          hide-details
          auto-grow
          v-model="fp_data[lt.field]"
          :rules="[rules.defined_n]"
        ></v-textarea>
        <v-chip
          v-for="orient in ['up','down']"
          small
          class="mr-2"
          @click="addText(orient, lt.field)"
        >
          <v-icon icon small>{{`fa-arrow-${orient}`}}</v-icon>
        </v-chip>
      </template>
    </v-col>
    <v-col cols="12">
      <svg class="selected-image"></svg>
    </v-col>
    <v-col 
      v-for="num in number_cols"
      :cols="num.is_perc ? null : 3"
      :key="num.field"
    >
      <v-text-field
        outlined
        type="number"
        class="mb-1"
        hide-details
        :name="num.field"
        :label="num.text"
        v-model="fp_data[num.field]"
        :rules="[rules.defined_n]"
      ></v-text-field>
      <template v-if="num.is_perc">
        <v-chip @click="fp_data[num.field] = 0">0.0</v-chip>
        <v-chip @click="fp_data[num.field] = 1.000">100</v-chip>
      </template>
      <template v-for="amm in available_ammounts">
        <v-chip 
          v-if="!num.is_perc && amm != fp_data[num.field]"
          class="mr-1 mb-1"
          @click="fp_data[num.field] = amm"
        >{{ format(amm) }}</v-chip>
      </template>
    </v-col>
  </v-row>
</template>