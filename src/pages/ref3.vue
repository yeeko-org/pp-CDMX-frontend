<script>

import { mapActions, mapState } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'References3',
  layout: 'diamonds',
  data () {
    return {
      width: 2200,
      height: 1700,
      current_image: undefined,
      selected_pp: undefined,
      loading: true,
      current_row: {},
      fp_data: {},
      base_url: 'https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/',
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
          color: 'amber',
          icon: 'fa-exclamation',
          text: 'Con pendientes',
          name: 'warning',
          calif_row: true,
          validated: false,
        },
        {
          color: 'purple',
          icon: 'fa-ellipsis-h',
          text: 'Por empezar',
          name: 'pending',
          validated: null,
        },
      ],
      status_verif: [
        { 
          color: 'grey',
          icon: 'fa-question',
          text: 'Desconocido',
          name: 'incompleted',
        },
        { 
          color: 'purple',
          icon: 'fa-exclamation-triangle',
          text: 'Requiere correcciones',
          name: 'need_review',
        },
        {
          color: 'light-blue',
          icon: 'fa-user-edit',
          name: 'modified',
          text: 'Corrección completa'
        },
        { 
          color: 'green',
          icon: 'fa-check-double',
          text: 'Validado',
          name: 'validated',
        },
      ],
    }
  },
  computed:{
    ...mapState({
      public_accounts_raw: state => state.reports.public_accounts,
    }),
    url(){
      if (!this.current_image)
        return ''
      let path = this.current_image.image.path
      let year = path.substr(3,4)
      return `${this.base_url}${year}/${path}`
    },
    public_accounts(){
      if (!this.public_accounts_raw)
        return []
      return this.public_accounts_raw.map(pa=>{
        let status_name = 'pending'
        if (pa.pp_images.some(img=> img.validated === false))
          status_name = 'warning'
        else if (pa.pp_images.every(img=> img.validated === true))
          status_name = 'complete'
        //else if (pa.pp_images.some(img=> img.validated === true))
          //status_name = 'incomplete'
        let status_calc = this.status_pp.find(st=>st.name == status_name)
        let status = this.status_verif.find(st=>st.name == pa.status)
        return { ...pa, ...{status_calc: status_calc}, ...{status_obj: status} }
      })
      .slice().sort((a,b)=> d3.ascending(a.townhall, b.townhall))
    },
    available_images(){
      if (!this.selected_pp)
        return []
      return this.selected_pp.pp_images.map(img=>(
        {...img, ...this.status_pp.find(st=>st.validated === img.validated)}))
          .slice().sort((a,b)=> d3.ascending(a.path, b.path))
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
          //? '#E91E63' //pink
          //? '#FFC107' //amber
          //? '#FF9800' //orange
          //: "#E0E0E0" //grey
          //? '#F44336' //red
          //? '#4CAF50' //green
          //? '#CDDC39' //lime
        /*let color = row.validated === false
          ? '#D81B60' //pink2
          : row.validated === true 
            ? '#009688' //teal
            : row.final_project
              ? has_errors
                ? '#FF5722' //deep-orange
                : double_row
                  ? '#673AB7' //deep-purple
                  : has_warnings
                    ? '#FF9800' //orange
                    : '#8BC34A' //ligth-green
              : has_first_col
                ? "#673AB7" //deep-purple
                : "#9E9E9E" //grey*/

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
        view_box: [(divs[0] - 40) || 0, start_y - 20,
                  divs[8] - divs[0] + 60, end_y - start_y + 30]
      }
    },
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
      if (!this.current_image)
        return []
      let final_projects = this.current_image.final_projects
      let fp_matched = final_projects.filter(fp=> fp.rows_count)
        .slice().sort((a,b)=> d3.descending(a.rows_count, b.rows_count))
      let fp_orphans = final_projects.filter(fp=> !fp.rows_count)
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
    next_need_review(){
      try{
        return this.rows[this.current_row.idx_up].need_review
      } catch(err){
        return false
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
    selected_pp(after){
      this.toBlank()
      const av_imgs = this.available_images
      try{
        let next_img = av_imgs.find(img => !img.validated) || av_imgs[0]
        this.resetImage(next_img.id)
      } catch(err){
        console.log(err)
      }
    }
  },
  methods:{
    ...mapActions({
      getNext : 'reports/GET_NEXT',
      postNext : 'reports/POST_NEXT',
      putRow : 'reports/PUT_ROW',
      putImage : 'reports/PUT_IMAGE',
      getImage : 'reports/GET_IMAGE',
      fetchPAs : 'reports/FETCH_PUBLIC_ACCOUNTS',
    }),
    toBlank(hard_reset=true){
      if (hard_reset)
        this.current_image = undefined
      this.current_row = {}
      this.fp_data = {}
    },
    fetchPublicAccounts(year){
      this.toBlank()
      this.selected_pp = undefined
      this.fetchPAs(`?year=${year}`)
    },
    resetImage(forced_id, show_next=false){
      let random_id = forced_id || Math.ceil(Math.random()*1006)
      let hard_reset = true
      let next_idx = this.current_row.idx_up
      try{ 
        hard_reset = this.current_image.image.id != forced_id
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
    saveRow(valid, show_next=false){
      this.fp_data.validated = valid
      this.loading = true
      this.putRow(this.fp_data).then(res=>{
        if (!show_next)
          this.$vuetify.goTo(0,
            {duration: 400, offset: 20, easing:'easeInOutCubic'})
        this.loading = false
        this.resetImage(this.current_image.image.id, show_next)
      })
    },
    saveImage(option){
      this.loading = true
      let curr_id = this.current_image.image.id
      let curr_pp = this.selected_pp.id
      let body = { validated: option }
      this.putImage([curr_id, curr_pp, body]).then(res=>{
        this.loading = false
        let img_idx = this.available_images.findIndex(img=>img.id==curr_id)
        try{
          let next_img = this.available_images[img_idx+1].id
          this.resetImage(next_img)
        } catch(err){}
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
      console.log(row)
      if (!row) return
      this.current_row = row
      let vm = this
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
      this.current_row[`idx_${orient}`] += suma
    },
    changeRow(direction){
      const suma = direction == 'left' ? -1 : 1
      this.updateSelected(this.rows[this.current_row.idx_tb + suma])
    },
  },
}
</script>

<template>
  <v-card>
    <v-row>
      <v-col cols="12" xl="7">
        <v-card-title primary-title class="pb-0">
          <v-select
            :items="['2014', '2015', '2015', '2016', '2017', '2018', '2019']"
            label="Año"
            outlined
            class="mr-3"
            style="max-width: 100px;"
            hide-details
            @change="fetchPublicAccounts"
          ></v-select>
          <v-select
            :items="public_accounts"
            label="Cuenta pública"
            return-object
            outlined
            hide-details
            item-value="id"
            v-model="selected_pp"
            style="max-width: 320px;"
          >
            <template v-slot:selection="{ item }">
              <v-icon :color="item.status_calc.color" class="mr-2">
                {{item.status_calc.icon}}
              </v-icon>
              {{item.townhall}}
            </template>
            <template v-slot:item="{ item }">
              <v-icon :color="item.status_calc.color" class="mr-2">
                {{item.status_calc.icon}}
              </v-icon>
              {{`${item.townhall} (${item.period_pp})`}}
              <v-icon :color="item.status_obj.color" class="ml-2">
                {{ item.status_obj.icon }}
              </v-icon>
            </template>
          </v-select>
          <v-select
            v-if="selected_pp"
            :items="status_verif"
            label="Status validación"
            outlined
            class="ml-3"
            style="max-width: 260px;"
            hide-details
            item-text="text"
            item-value="name"
            return-object
            v-model="selected_pp.status_obj"
            _change="fetchPublicAccounts"
          >
            <template v-slot:selection="{ item }">
              <v-icon :color="item.color" class="mr-2">
                {{item.icon}}
              </v-icon>
              <span :class="`${item.color}--text`">
                {{item.text}}
              </span>
            </template>
            <template v-slot:item="{ item }">
              <v-icon :color="item.color" class="mr-2">
                {{item.icon}}
              </v-icon>
              {{item.text}}              
            </template>
          </v-select>
          <span v-if="selected_pp">
            {{selected_pp.status}}
            {{selected_pp.status_obj}}
          </span>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-row v-if="selected_pp" align="center">
          <v-col cols="auto" class="pt-0 grow">
            Páginas:
            <v-chip 
              v-for="img in available_images"
              :key="img.id"
              class="ml-2 mb-2"
              :color="img.color"
              :outlined="current_image ? current_image.image.id != img.id : true"
              dark
              @click="resetImage(img.id)"
            >{{img.path.substr(-6,2)}}</v-chip>
          </v-col>
          <v-col cols="auto" class="pt-0 shrink">
            <v-select
              v-if="current_image"
              outlined
              style="max-width: 200px;"
              :items="status_pp.filter(st=>st.validated !== undefined)"
              v-model="current_image.image.validated"
              item-value="validated"
              item-text="text"
              @change="saveImage"
              label="Status de página"
            >          
              <template v-slot:selection="{ item } ">
                <span :class="`${item.color}--text`">
                  {{ item.text }}
                </span>
              </template>
              <template v-slot:item="{ item } ">
                <span :class="`${item.color}--text`">
                  {{ item.text }}
                </span>
              </template>
            </v-select>
          </v-col>
        </v-row>
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
            v-for="orient in ['left','right']"
            color="accent"
            icon
            class="ml-2"
            @click="changeRow(orient)"
          >
            <v-icon>{{`fa-angle-double-${orient}`}}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-for="option in status_pp.filter(x=>x.calif_row)"
            :color="option.color"
            class="ml-12"
            :loading="loading"
            :key="option.text"
            _class="`${option.color}--text`"
            @click="saveRow(option.validated)"
          >
            Guardar {{ option.text }}
          </v-btn>
          <v-btn
            color="success"
            class="ml-12"
            :loading="loading"
            _class="`${option.color}--text`"
            @click="saveRow(true, true)"
            :fab="next_need_review"
            :icon="!next_need_review"
          >
            <v-icon>fa-forward</v-icon>
          </v-btn>
        </v-card-title>
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
      </v-col>
    </v-row>
    <div id="bottom_page"></div>
  </v-card>
</template>