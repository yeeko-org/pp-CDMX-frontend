<script>

import { mapActions, mapState } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'References3',
  layout: 'diamonds',
  components: {  },  
  data () {
    return {
      width: 2200,
      height: 1700,
      current_image: undefined,
      selected_pp: undefined,
      loading: true,
      current_row: {},
      fp_data: {},
      show_all_subs: false,
      excercises: [],
      base_url: 'https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/',
      special_images: [721, 363, 348, 895, 839],
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
          color: 'green',
          icon: 'fa-check-double',
          text: 'Completo',
          name: 'complete',
          validated: true,
        },
        {
          color: 'amber',
          icon: 'fa-exclamation-triangle',
          text: 'Con pendientes',
          name: 'warning',
          validated: false,
        },
        {
          color: 'lime',
          icon: 'fa-folder-open',
          text: 'Incompleto',
          name: 'incomplete'
        },
        {
          color: 'purple',
          icon: 'fa-ellipsis-h',
          text: 'Por empezar',
          name: 'pending',
          validated: null,
        },
      ],
      valid_options: [
        {
          title: "Pendiente",
          color: "orange",
          validated: null,
        },
        {
          title: "Válido",
          color: "green",
          validated: true,
        },
        {
          title: "Inválido",
          color: "red",
          validated: false,
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
        console.log(pa)
        let status_name = 'pending'
        if (pa.pp_images.some(img=> img.validated === false))
          status_name = 'warning'
        else if (pa.pp_images.every(img=> img.validated === true))
          status_name = 'complete'
        else if (pa.pp_images.some(img=> img.validated === true))
          status_name = 'incomplete'
        let status = this.status_pp.find(st=>st.name == status_name)
        return ({...pa, ...{ status: status }})
      })
      .slice().sort((a,b)=> d3.ascending(a.period_pp, b.period_pp))
    },
    available_images(){
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
        let has_errors = row.errors.some(err => !err.includes('Variación'))
        let has_first_col = false 
        try{
          has_first_col = !!row.formatted_data[0]
        } catch(err){
          console.log(err)
        }
        let double_row = false 
        if (final_proj){
          if (final_proj.rows_count > 1)
            double_row = true
        }
        let color = row.validated === false
          ? '#F44336' //red
          : row.validated === true 
            ? '#4CAF50' //green
            : row.final_project
              ? has_errors
                ? '#FFC107' //amber
                : double_row
                  ? '#673AB7' //deep-purple
                  : '#CDDC39' //lime
              : has_first_col
                ? "#9C27B0" //purple
                : "#9E9E9E" //grey
        let complement_row = { 
          final_project_obj: final_proj,
          color: color,
          idx_tb: idx,
          idx_up: idx+1,
          idx_down: idx-1,
        }
        return {...row, ...complement_row}
      })
      console.log(final_rows)
      return final_rows
    },
    image_refs(){
      if (!this.current_image || !this.rows.length)
        return {}
      let divs = this.current_image.image.table_ref_columns
      let start_y = (this.rows[0].top || 340) - 100
      console.log(this.rows)
      let end_y = this.rows[this.rows.length - 1].bottom || this.height
      return { 
        divisors: divs,
        view_box: [(divs[0] - 40) || 0, start_y,
                  divs[8] - divs[0] + 40, end_y - start_y]
      }
    },
    available_ammounts(){
      let ammounts = this.number_cols.filter(num=> !num.is_perc)
      return ammounts.reduce((tot, num)=> {
        let curr_num = parseFloat(this.fp_data[num.field])
        if (!curr_num || tot.includes(curr_num))
          return tot
        else
          return [...tot, curr_num]
      },[0])
    },
    custom_remain(){
      if (!this.current_image)
        return []
      let final_projects = this.current_image.final_projects
      let fp_matched = final_projects.filter(fp=> fp.rows_count)
        .slice().sort((a,b)=> d3.descending(a.rows_count, b.rows_count))
      let fp_orphans = final_projects.filter(fp=> !fp.rows_count)
      return [...fp_orphans, ...fp_matched]
       
    },
    selectedSuburb(){
      try{
        return this.custom_remain.find(sub=>
          sub.id == this.fp_data.final_project).suburb_cve_col
      }catch(err){
        return " ------ "
      }

    }
  },
  mounted(){
  },
  watch:{
    selected_pp(after){
      this.current_image = undefined
      this.current_row = {}
      this.fp_data = {}
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
    fetchPublicAccounts(year){
      this.current_image = undefined
      this.current_row = {}
      this.fp_data = {}      
      this.selected_pp = undefined
      this.fetchPAs(`?year=${year}`)
    },
    resetImage(forced_id){
      let random_id = forced_id || Math.ceil(Math.random()*1006)
      let hard_reset = true
      if (this.current_image){
        if (this.current_image.image.id == forced_id)
          hard_reset = false
      }
      if (hard_reset)
        this.current_image = undefined
      this.current_row = {}
      this.fp_data = {}
      this.getImage(random_id).then(res=>{
        this.loading = false
        this.current_image = res
        this.drawImage()
        return
      })
    },
    saveRow(option){
      this.fp_data.validated = option.validated
      this.loading = true
      this.putRow(this.fp_data).then(res=>{
        this.$vuetify.goTo(0,
          {duration: 400, offset: 20, easing:'easeInOutCubic'})
        this.loading = false
        this.resetImage(this.current_image.image.id)
      })
    },
    saveImage(option){
      this.loading = true
      let body = { validated: option }
      let curr_id = this.current_image.image.id
      let curr_pp = this.selected_pp.id
      this.putImage([curr_id, curr_pp, body]).then(res=>{
        this.loading = false
        let img_idx = this.available_images.findIndex(img=>img.id==curr_id)
        console.log(this.selected_pp.pp_images)
        try{
          let next_img = this.available_images[img_idx+1].id
          this.resetImage(next_img)
        } catch(err){
          console.log("todo está completo")
        }

      })
    },
    format(num){
      return d3.format(',')(num)
    },
    colorStart(simil){
      let color = d3.scaleSequential(d3.interpolateTurbo)
        .domain([1.3,0.7])
      return simil == 0
        ? '#9C27B0' //purple
        : color(simil)
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
      //console.log(vm.rows)

      let start_x = vm.image_refs.divisors[0]
      let squares = svg
        .selectAll("rect")
        .data(vm.rows)
          .join("rect")
            .style("width", vm.width)
            .style("opacity", 0.2)
            .style("height", d=> d.bottom - d.top - 2)
            .attr("fill", (d, i) => d.color)
            .attr("transform", d => `translate(${start_x}, ${d.top + 1})`)
            .on("click", vm.updateSelected)

      let symbol = d3.symbol().size(400)
      let symbols = svg
        .selectAll("path")
        .data(vm.rows)
          .join("path")
            .style("opacity", d=> d.validated ? 1 : 0.6)
            .attr("fill", d => vm.colorStart(d.similar_suburb_name))
            .attr("transform", d => `translate(${start_x - 20}, ${d.top + 20})`)
            .attr('d', d => symbol.type(d3.symbols[4])())
            .attr("cursor", 'pointer')
            //.on("click", vm.updateSelected)

      let lines = svg
        .selectAll("lines")
        .data(vm.image_refs.divisors)
          .join("rect")
            .style("width", 1)
            .style("height", vm.height)
            .attr("fill", '#249bda')
            .attr("transform", d => `translate(${d},0)`)
    },
    updateSelected(row){
      let vm = this
      console.log(row)
      this.current_row = row
      this.fp_data = {...{}, ...row}

      let divs = this.image_refs.divisors

      let y0 = row.top - 10
      let y1 = row.bottom - row.top + 20
      
      let buildViewBox = (ref) => (
        [ divs[ref.idx0] - 20, y0, divs[ref.idx1] - divs[ref.idx0] + 40, y1])

      let images_to_build = [
        { idx0: 0, idx1: 3, fields: this.large_texts },
        { idx0: 3, idx1: 8, fields: this.number_cols },
      ]

      var svg_images = d3.selectAll(".selected-image")
        .data(images_to_build)
          .join()
          .attr("viewBox", d=> buildViewBox(d))
      
      svg_images.selectAll("#back_image2")
        .data([vm.url])
        .join("image")
          .attr('xlink:href', d=> d)
          .attr('width', vm.width)
          .attr('id', d=>{
            return 'back_image2'
          })

      let square1 = svg_images
        .selectAll("rect")
        .data(d=>d.fields)
          .join("rect")
            .style("width", function(d, i){
              let parent = d3.select(this.parentNode).datum()
              return divs[parent.idx0 + i +1 ] - divs[parent.idx0 + i ] - 4
            })
            .style("height", row.bottom - row.top)
            .attr("fill", function(d){
              let parent = d3.select(this.parentNode).datum()
              if (parent.idx0 && ( row.final_project )){
                if (row.errors.some(err=> err.includes(d.text)))
                  return '#FFC107' //amber
              }
              if (d.idx)
                return '#CDDC39' //lime
              else{
                if (row.final_project_obj){
                  if (row.final_project_obj.rows_count == 1)
                    return '#CDDC39' //lime
                  else 
                    return row.color
                }

                return row.color
              }
            })
            .attr("opacity", 0.15)
            .attr("transform", function(d, i){
              let parent = d3.select(this.parentNode).datum()
              return `translate(${divs[i+parent.idx0] - 2},${row.top})`
            })
    },
    addSpace(orient){
      let up = orient == 'up'
      var svg_images = d3.selectAll(".selected-image")
      svg_images
        .attr("viewBox", function(d){
          try{
            let current_vb =  d3.select(this).attr("viewBox").split(',')
            current_vb[1] = parseInt(current_vb[1]) - (up ?  50 : 0 )
            current_vb[3] = parseInt(current_vb[3]) + 50
            return current_vb
          }catch(err){
            console.log(err)
          }
        })
    },
    addText(orient, field){
      const suma = orient == 'up' ?  1 : -1
      const ref_idx = this.current_row[`idx_${orient}`]
      //const table_data = this.current_image.image.table_data[ref_idx]
      //const table_data = this.current_row.formatted_data
      const table_data = this.rows[ref_idx].formatted_data
      console.log(table_data)
      if (!table_data.length)
        return
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
      let new_row = this.rows[this.current_row.idx_tb+suma]
      if (new_row)
        this.updateSelected(new_row)
    },
  },

}
</script>

<template>
  <v-card>
    <v-card-title primary-title class="pb-0">
      <v-select
        :items="['2014', '2015', '2015', '2016', '2017', '2018', '2019']"
        label="Año"
        outlined
        class="mr-3"
        style="max-width: 100px;"
        @change="fetchPublicAccounts"
      ></v-select>
      <v-select
        :items="public_accounts"
        label="Cuenta pública"
        return-object
        outlined
        item-value="id"
        v-model="selected_pp"
        style="max-width: 350px;"
      >
        <template v-slot:selection="{ item }">
          {{item.townhall}}
        </template>
        <template v-slot:item="{ item }">
          <v-icon :color="item.status.color" class="mr-2">
            {{item.status.icon}}
          </v-icon>
          {{`${item.townhall} (${item.period_pp})`}}
        </template>
      </v-select>
      <v-spacer></v-spacer>
      <template v-if="false">
        <v-btn 
          v-for="img_id in special_images"
          color="accent"
          small
          class="px-2 mr-1"
          @click="resetImage(img_id)"
        >{{img_id}}</v-btn>
        <v-btn color="accent" @click="resetImage()">Recargar</v-btn>
      </template>
    </v-card-title>
    <v-card-text>
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
      <v-row v-show="current_row.color">
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
            v-for="option in status_pp.filter(x=>x.validated!==null && x.validated!==undefined)"
            :color="option.color"
            class="ml-12"
            :loading="loading"
            :key="option.text"
            _class="`${option.color}--text`"
            @click="saveRow(option)"
          >
            Guardar {{ option.text }}
          </v-btn>
        </v-card-title>
        <v-col cols="12" v-if="current_row.errors">
          <v-alert
            type="error"
            v-for="error in current_row.errors.filter(err=> 
              !err.includes('converir'))"
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
        <v-col cols="12" v-if="false">
          <v-textarea
            name="comments"
            hide-details
            rows="3"
            auto-grow
            label="Notas de apoyo"
            outlined
          ></v-textarea>
        </v-col>
      </v-row>
      
    </v-card-text>
  </v-card>
</template>