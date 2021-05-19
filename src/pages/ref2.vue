<script>

import { mapActions, mapState } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'References',
  layout: 'diamonds',
  components: {  },  
  data () {
    return {
      width: 2200,
      height: 1700,
      current_image: undefined,
      divisors: undefined,
      references: undefined,
      selected_pp: undefined,
      loading: true,
      current_row: {},
      fp_data: {},
      excercises: [],
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
        { text: 'Proyecto', field: 'final_name', cols: 4, idx: 1},
        { text: 'Descripción', field: 'description_cp', cols: 5, idx: 2},
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
    }
  },
  computed:{
    ...mapState({
      public_accounts_raw: state => state.reports.public_accounts,
    }),
    base_url(){
      let base = 'https://cdn-yeeko.s3-us-west-2.amazonaws.com/ollin/'
      if (false)
        base+='2018/'
      return process.env.NODE_ENV == 'development' ? base : ''
    },
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
      if (!this.current_image)
        return []
      let table_ref = curr_img.image.table_ref
      let table_data = curr_img.image.table_data
      let final_projs = curr_img.final_projects
      let final_rows = table_data.map((row, idx)=>{
        let final_proj = final_projs.find(proj=> 
          proj.data_raw.raw[0] == row[0])
        let orphan_data = curr_img.orphan_rows.find(orphan=>
          orphan.raw[0] == row[0])
        let has_anomalies = false
        if (final_proj){
          has_anomalies = final_proj.anomalies.some(an=>
            (!an.anomaly.is_public && !an.anomaly.name.includes('Variación')))
        }
        let color = final_proj
          ? final_proj.validated === false
            ? '#F44336' //red
            : final_proj.validated === true 
              ? '#4CAF50' //green
              : has_anomalies
                ? '#FFC107' //amber
                : '#CDDC39' //lime
          : orphan_data
            ? "#9C27B0" //purple
            : "#9E9E9E" //grey
        return { 
          raw: row,
          refs: table_ref[idx],
          final_project: final_proj,
          color: color,
          orphan_data: orphan_data,
        }
      })
      //console.log(final_rows)
      return final_rows
    },
    image_refs(){
      if (!this.current_image)
        return {}
      let json_vars = this.current_image.image.json_variables
      let start_x = 0
      let end_x = this.width
      let start_y = json_vars.unidad_bot || 240
      let end_y = json_vars.columns_data_bot || this.height
      let manual_ref = this.current_image.image.manual_ref
      let divisors = []
      if (manual_ref){
        start_x = manual_ref.left
        end_x = manual_ref.right
        start_y = manual_ref.columns_top
        divisors = [...manual_ref.divisors, end_x]
        end_y = manual_ref.columns_bot
      }
      else{
        start_x = json_vars.columns_boxs[0].left
        end_x = json_vars.columns_boxs[7].right
        divisors = json_vars.columns_boxs.map(box => box.right)
      }
      let x_refs = [start_x, ...divisors]
      return { 
        divisors: x_refs,
        view_box: [start_x - 20, start_y, end_x - start_x + 40, end_y - start_y]
      }
      
    },
    available_ammounts(){
      let ammounts = this.number_cols.filter(num=> !num.is_perc)
      return ammounts.reduce((tot,num)=> {
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
      let final_proj = this.current_row.final_project
      if (final_proj){
        let curr_sub = { 
          suburb: final_proj.suburb,
          suburb_name: final_proj.suburb_name
        }
        return [ final_proj, ...this.current_image.orphan_suburbs ]
      }
      return this.current_image.orphan_suburbs
    },
    selectedSuburb(){
      try{
        return this.custom_remain.find(sub=>
          sub.suburb == this.fp_data.suburb).suburb_name
      }catch(err){
        return " ------ "
      }

    }
  },
  mounted(){
  },
  methods:{
    ...mapActions({
      getNext : 'reports/GET_NEXT',
      postNext : 'reports/POST_NEXT',
      getImage : 'reports/GET_IMAGE',
      fetchPAs : 'reports/FETCH_PUBLIC_ACCOUNTS',
    }),
    fetchPublicAccounts(year){
      this.fetchPAs(`?year=${year}`)
    },
    resetImage(forced_id){
      let random_id = forced_id || Math.ceil(Math.random()*1006)
      this.getImage(random_id).then(res=>{
        /*this.excercises = this.res.orphan_suburbs.map(proj=>(
          { suburb: proj.suburb, seq: undefined, sub_name: proj.suburb_short_name }
        ) )*/
        this.fp_data = {}
        this.current_row = {}
        console.log(res)
        this.loading = false
        this.current_image = res
        this.drawImage()
        return
      })
    },
    saveNext(){
      let new_data = {
        id: this.current_image.id,
        //references: this.references,
      }
      return
      this.loading = true
      this.postNext(new_data).then(res=>{
        this.$vuetify.goTo(0,
          {duration: 400, offset: 20, easing:'easeInOutCubic'})

        this.loading = false
        d3.select("#back_image")
          .attr('xlink:href',  `${this.base_url}${res.url}`)
        this.current_image = res
        this.drawImage()
      })
    },
    format(num){
      return d3.format(',')(num)
    },
    drawImage(){
      let vm = this
          
      var svg = d3.select("#imageback")
        //.attr("viewBox", [0, 0, vm.width, vm.height])
        .attr("viewBox", vm.image_refs.view_box)
      console.log(svg)
      
      //let url = vm.current_image.url
      svg.selectAll("#back_image")
        .data([vm.url])
        .join("image")
          .attr('xlink:href', d=> d)
          .attr('width', vm.width)
          .attr('id', 'back_image')

      console.log(vm.rows)

      let squares = svg
        .selectAll("rect")
        .data(vm.rows)
          .join("rect")
            .style("width", vm.width)
            .style("opacity", 0.2)
            //.style("stroke", 'red')
            .style("height", d=> d.refs.bot - d.refs.top - 2)
            //.attr("fill", (d, i) => d3.schemeCategory10[i%10])
            .attr("fill", (d, i) => d.color)
            .attr("transform", d => `translate(0, ${d.refs.top + 1})`)
            .on("click", vm.updateSelected)

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
      if (row.final_project){
        this.fp_data = this.number_cols.reduce((final, amm)=>{
          return {...final, ...{ [amm.field]: row.final_project[amm.field] }}
        },{})
        this.large_texts.forEach(lt=>{
          this.fp_data[lt.field] = row.final_project[lt.field]
        })
      }
      else{
        this.fp_data = {}
        let base_raw = row.orphan_data ? row.orphan_data.data : row.raw
        if (row.orphan_data){
          this.fp_data = this.number_cols.reduce((final, amm)=>{
            return {...final, ...{ [amm.field]: base_raw[amm.idx] }}
          },{})
        }
        this.large_texts.forEach(lt=>{
          if (lt.idx)
            this.fp_data[lt.field] = base_raw[lt.idx]
        })
      }

      let divs = this.image_refs.divisors

      let y0 = row.refs.top - 10
      let y1 = row.refs.bot - row.refs.top + 20
      
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
            .style("height", row.refs.bot - row.refs.top)
            .attr("fill", function(d){
              let parent = d3.select(this.parentNode).datum()
              if (parent.idx0 && (row.final_project || row.orphan_data )){
                let errors = row.final_project
                  ? row.final_project.data_raw.errors
                  : row.orphan_data.errors
                if (errors.some(err=> err.includes(d.text)))
                  return '#FFC107' //amber
              }
              if (d.idx)
                return '#CDDC39' //lime
              else
                return row.color
            })
            .attr("opacity", 0.15)
            .attr("transform", function(d, i){
              let parent = d3.select(this.parentNode).datum()
              return `translate(${divs[i+parent.idx0] - 2},${row.refs.top})`
            })
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
      <v-btn 
        v-for="img_id in special_images"
        color="accent"
        small
        class="px-2 mr-1"
        @click="resetImage(img_id)"
      >{{img_id}}</v-btn>
      <v-btn color="accent" @click="resetImage()">Recargar</v-btn>
    </v-card-title>
    <v-card-text>
      <v-row v-if="selected_pp" align="center">
        Páginas:
        <v-chip 
          v-for="img in available_images"
          :key="img.id"
          class="ml-2 mb-2"
          :color="img.color"
          dark
          @click="resetImage(img.id)"
        >{{img.path.substr(-6,2)}}</v-chip>
      </v-row>
      <v-row>
        <v-col cols="12" v-if="false">
          Ubica los rombos grandes al comienzo y al final de los datos
          <br>Los rombos pequeños, si hay, en la división entre las columnas
        </v-col>
        <v-col cols="12">
          <svg id="imageback"></svg>
        </v-col>
        <v-card-title primary-title>
          Colonia seleccionada:
        </v-card-title>
        <v-col cols="12">
          <svg class="selected-image"></svg>
        </v-col>
        <v-col
          v-for="lt in large_texts"
          :cols="lt.cols" 
          :key="lt.field"
        >
          <template v-if="lt.field == 'suburb'">
            <v-select
              :items="custom_remain"
              v-model="fp_data.suburb"
              item-value="suburb"
              item-text="suburb_name"
              outlined
              label="Colonia coincidente"
            ></v-select>
            {{selectedSuburb}}
          </template>
          <v-textarea 
            v-else
            :label="lt.text"
            outlined
            v-model="fp_data[lt.field]"
          ></v-textarea>
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
            <v-chip @click="fp_data[num.field] = 100.0">100</v-chip>
          </template>
          <template v-for="amm in available_ammounts">
            <v-chip 
              v-if="!num.is_perc && amm != fp_data[num.field]"
              class="mr-1 mb-1"
              @click="fp_data[num.field] = amm"
            >{{ format(amm) }}</v-chip>
          </template>
        </v-col>
        <v-col cols="12">
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
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="success" :loading="loading" @click="saveNext">Guardar referencias</v-btn>
    </v-card-actions>
  </v-card>
</template>