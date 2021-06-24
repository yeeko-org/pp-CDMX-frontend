<script>

import { mapActions } from "vuex";
import * as d3 from 'd3';
import NavPA from "~/components/validation/NavPA";
import EditRow from "~/components/validation/EditRow";

export default {
  name: 'References3',
  layout: 'diamonds',
  components: { NavPA, EditRow },
  data () {
    return {
      width: 2200,
      height: 1700,
      current_image: undefined,
      loading: true,
      current_row: {},
      base_url: 'https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/',
      status_pp: [
        {
          color: 'light-green',
          icon: 'fa-check-circle',
          text: 'Completo',
          name: 'complete',
          calif_row: true,
          validated: true,
        },
        {
          color: 'blue',
          color_row: 'pink',
          icon: 'fa-exclamation',
          text: 'Corregido',
          text_row: 'Con pendientes',
          name: 'warning',
          calif_row: true,
          validated: false,
        },
        {
          color: 'purple',
          icon: 'fa-ellipsis-h',
          text: 'Pendiente',
          name: 'pending',
          validated: null,
        },
      ],
      nav_pages: [
        { icon: 'backward', icon_row: 'left', fast: true, next: -1,
          key: 'ArrowLeft', key_row: 'ArrowUp' },
        { icon: 'backward', icon_row: 'left', fast: false, next: -1,
          key: 'ArrowLeft', key_row: 'ArrowUp' },
        { icon: 'forward', icon_row: 'right', fast: false, next: 1,
          key: 'ArrowRight', key_row: 'ArrowDown' },
        { icon: 'forward', icon_row: 'right', fast: true, next: 1,
          key: 'ArrowRight', key_row: 'ArrowDown' }
      ],
    }
  },
  computed:{
    url(){
      if (!this.current_image)
        return ''
      let path = this.current_image.image.path
      let year = path.substr(3,4)
      return `${this.base_url}${year}/${path}`
    },
    rows(){
      let curr_img = this.current_image
      if (!curr_img)
        return []
      let all_rows = curr_img.rows.slice().sort((a,b)=> 
        d3.ascending(a.sequential, b.sequential))
      let final_rows = all_rows.map((row, idx)=>{
        let final_proj = curr_img.final_projects.find(fp=>
          fp.id == row.final_project)
        const relev_errors = row.errors.filter(err=> !err.includes('Variación'))
        let has_warnings = relev_errors.some(err => 
           err.includes('anormal') || !err.includes('columna'))
        let without_some_text = false
        if (!row.project_name || !row.description){
          row.errors = [...row.errors, "No se registró alguna columna de texto"]
          without_some_text = true
        }
        let has_errors = relev_errors.some(err => 
          err.includes('columna') && !err.includes('anormal'))
        let has_first_col = false 
        try{
          has_first_col = !!row.formatted_data[0]
        } catch(err){
          console.log(err)
        }
        let double_row = false 
        try{
          double_row = final_proj.rows_count > 1
        }catch(err){}
        let color = row.validated === false
          ? '#D81B60' //pink2
          : row.validated === true 
            ? '#009688' //teal
            : row.final_project
              ? double_row
                ? '#673AB7' //deep-purple
                : has_errors
                  ? '#FF5722' //deep-orange
                  : (has_warnings || without_some_text)
                    ? '#FF9800' //orange
                    : '#8BC34A' //ligth-green
              : has_first_col
                ? "#673AB7" //deep-purple
                : "#9E9E9E" //grey
        let need_review = row.validated === null
          ? double_row || (has_first_col && (!row.final_project || has_errors))
          : !row.validated
        let complement_row = { 
          final_project_obj: final_proj,
          color: color,
          idx_tb: idx,
          idx_up: idx+1,
          idx_down: idx-1,
          need_review: need_review,
          double_row: double_row,
        }
        return {...row, ...complement_row}
      })
      return final_rows
    },
    image_refs(){
      if (!this.current_image || !this.rows.length)
        return {}
      let divs = this.current_image.image.table_ref_columns
      let start_y = (this.rows[0].top || 340)
      let end_y = this.rows[this.rows.length - 1].bottom || this.height
      return { 
        divs: divs,
        y: [start_y, end_y],
        view_box: [( divs[0] - 40) || 0,        start_y - 20,
                     divs[8] - divs[0] + 60,    end_y - start_y + 30 ]
      }
    },
    next_need_review(){
      try{
        return this.rows[this.current_row.idx_up].need_review
      } catch(err){
        return false
      }
    },
  },
  mounted(){
    window.addEventListener('keydown', (e) => {
      if (e.path.length < 6 && this.current_image){
        let curr_nav = this.nav_pages.find(nav=>
          nav.key_row == e.key && nav.fast == e.ctrlKey)
        if (curr_nav){
          this.changeRow2(curr_nav)
        }
      }
    });
  },
  methods:{
    ...mapActions({ getImage : 'reports/GET_IMAGE', }),
    toBlank(hard_reset=true){
      if (hard_reset)
        this.current_image = undefined
      this.current_row = {}
    },
    resetImage([forced_id, show_next=false]){
      let random_id = forced_id || Math.ceil(Math.random()*1006)
      let hard_reset = true
      let next_idx = this.current_row.idx_up
      try{ 
        hard_reset = this.current_image.image.id !== forced_id
      } catch(err) {}
      this.toBlank(hard_reset)
      this.getImage(random_id).then(res=>{
        this.loading = false
        this.current_image = res
        this.drawImage()
        if (show_next)
          this.$nextTick(()=>{
            let next_row = this.rows.find((rw, idx)=>
              rw.need_review && idx >= next_idx)
            this.updateSelected(next_row)
          })
      })
    },
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
    drawImage(){
      let vm = this
      var svg = d3.select("#imageback")
        .attr("viewBox", vm.image_refs.view_box)
      
      svg.selectAll("#back_image")
        .data([vm.url])
        .join("image")
          .attr('xlink:href', d=> d)
          .attr('width', vm.width)
          .attr('id', 'back_image');

      let start_x = vm.image_refs.divs[0]
      let end_x = vm.image_refs.divs[8]

      let squares = svg
        .selectAll("rect")
        .data(vm.rows)
          .join("rect")
            .style("width", end_x - start_x)
            .attr("id", 'rect-color')
            .style("height", d=> d.bottom - d.top)
            .attr("fill", (d, i) => d.color)
            .style("fill-opacity", 0.2)
            .attr("stroke", '#304FFE')
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.8)
            .attr("transform", d => `translate(${start_x}, ${d.top})`)
            .on("click", vm.updateSelected)

      let symbol = d3.symbol().size(400)
      let symbols = svg
        .selectAll("path")
        .data(vm.rows)
          .join("path")
            .attr("fill", d => vm.colorStart(d))
            .attr("transform", d => `translate(${start_x - 20}, ${d.top + 20})`)
            .attr('d', d => symbol.type(d3.symbols[4])())
            .attr("cursor", 'pointer')
            .on("click", vm.updateSelected)

      let lines = svg
        .selectAll("lines")
        .data(vm.image_refs.divs)
          .join("rect")
            .style("width", 1)
            .style("height", vm.image_refs.y[1] - vm.image_refs.y[0])
            .attr("fill", '#304FFE')
            .attr("transform", d => `translate(${d},${vm.image_refs.y[0]})`)
    },
    updateSelected(row){
      if (!row)
        return
      this.current_row = row
    },
    changeRow2(nav){
      try{
        let rows = this.rows
        if (nav.fast)
          rows = rows.filter(row=>row.need_review)
        const row_id = this.current_row.id
        let next_row = rows[0]
        if (row_id){
          const row_idx = rows.findIndex(row=> row.id == row_id)
          next_row = rows[row_idx+nav.next]
        }
        this.updateSelected(next_row)
      } catch(err){ }
    },
    updateIdx([idx_ref, suma]){
      this.current_row[idx_ref] += suma
    }
  },
}
</script>

<template>
  <v-card>
    <v-row>
      <v-col cols="12" xl="7">
        <NavPA
          :status_pp="status_pp"
          :nav_pages="nav_pages"
          :current_image="current_image"
          @to-blank="toBlank()"
          @reset-image="resetImage($event)"
        />
        <svg id="imageback" v-show="current_image"></svg>
        <v-divider></v-divider>
      </v-col>
      <div id="bottom_page3"></div>
      <v-col cols="12" xl="5" v-show="current_row.color">
        <div id="bottom_page2"></div>
        <v-card-title primary-title>
          Colonia seleccionada
          <v-spacer></v-spacer>
          <v-btn
            v-for="nav in nav_pages"
            color="accent"
            icon
            class="ml-2"
            @click="changeRow2(nav)"
          >
            <v-icon>
              {{`fa-angle-${nav.fast ? 'double-' : ''}${nav.icon_row}`}}
            </v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-for="option in status_pp.filter(x=>x.calif_row)"
            :color="option.color_row || option.color"
            class="ml-12"
            :loading="loading"
            :key="option.text"
            _class="`${option.color}--text`"
            @click="$refs.row.saveRow(option.validated)"
          >
            Guardar {{ option.text_row || option.text }}
          </v-btn>
          <v-btn
            color="success"
            class="ml-12"
            :loading="loading"
            _class="`${option.color}--text`"
            @click="$refs.row.saveRow(true, true)"
            :fab="next_need_review"
            :icon="!next_need_review"
          >
            <v-icon>fa-forward</v-icon>
          </v-btn>
        </v-card-title>
        <EditRow
          ref="row"
          :image_refs="image_refs"
          :rows="rows"
          :url="url"
          :current_row="current_row"
          :current_image="current_image"
          @update-idx="updateIdx($event)"
          @reset-image="resetImage($event)"
        />
      </v-col>
    </v-row>
    <div id="bottom_page"></div>
  </v-card>
</template>