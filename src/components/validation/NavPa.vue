<script>

import { mapActions, mapState } from "vuex";
import * as d3 from 'd3';

export default {
  name: 'NavPA',
  props:{
    status_pp: { type: Array, required: true },
    nav_pages: { type: Array, required: true },
    current_image: { type: Object, required: false },
  },
  data () {
    return {
      selected_pp: undefined,
      current_year: '',
      loading: true,
      pp_images: [],
      status_verif: [
        { 
          color: 'purple',
          icon: 'fa-clock',
          text: 'Inicial',
          name: 'incompleted',
          order: 1,
        },
        {
          color: 'light-blue',
          icon: 'fa-eye',
          name: 'first',
          order: 3,
          text: 'Primera corrección'
        },
        { 
          color: 'purple',
          icon: 'fa-exclamation-triangle',
          text: 'Requiere correcciones',
          name: 'need_review',
          order: 2,
        },
        {
          color: 'blue',
          icon: 'fa-user-edit',
          name: 'modified',
          order: 4,
          text: 'Corrección completa'
        },
        { 
          color: 'red',
          icon: 'fa-user-friends',
          text: 'Revisar juntos',
          name: 'together',
          order: 5,
        },
        { 
          color: 'green',
          icon: 'fa-check-double',
          text: 'Validado',
          name: 'validated',
          order: 6,
        },
      ],
    }
  },
  computed:{
    ...mapState({
      public_accounts_raw: state => state.reports.public_accounts,
    }),
    public_accounts(){
      if (!this.public_accounts_raw)
        return []
      let pas = this.public_accounts_raw.map(pa=>{
        let status = this.status_verif.find(st=>st.name == pa.status)
        return { ...pa, ...{status_obj: status} }
      })
      if (this.current_year)
        return pas.filter(pa=>pa.period_pp == this.current_year)
          .slice().sort((a,b)=>d3.ascending(a.townhall, b.townhall))
      else
        return pas.slice().sort((a,b)=>
          d3.ascending(a.status_obj.order, b.status_obj.order))
    },
    available_images(){
      //if (!this.selected_pp)
        //return []
      return this.pp_images.map(img=>(
        {...img, ...this.status_pp.find(st=>st.validated === img.validated)}))
          .slice().sort((a,b)=> d3.ascending(a.path, b.path))
    },
  },
  created(){
    this.fetchPAs('')
  },
  mounted(){
    window.addEventListener('keydown', (e) => {
      if (e.path.length < 6 && this.current_image){
        let curr_nav = this.nav_pages.find(nav=>
          nav.key == e.key && nav.fast == e.ctrlKey)
        if (curr_nav)
          this.changeImage(curr_nav)
      }
    });
  },
  watch:{
    selected_pp(after){
      if (!after)
        return
      console.log(after)
      this.$emit('to-blank')
      this.fetchPAs(`${after.id}/`).then(res=>{
        this.pp_images = res.pp_images
        const av_imgs = this.available_images
        try{
          let next_img = av_imgs.find(img => img.validated === null)
                        || av_imgs.find(img => img.validated === false)
                        || av_imgs[0]
          this.$emit('reset-image', [next_img.id])
        } catch(err){
          console.log("HOLA WATCH")
          console.log(err)
        }
      })
    }
  },
  methods:{
    ...mapActions({
      getNext : 'reports/GET_NEXT',
      postNext : 'reports/POST_NEXT',
      putImage : 'reports/PUT_IMAGE',
      fetchPAs : 'reports/FETCH_PUBLIC_ACCOUNTS',
      putPA : 'reports/PUT_PA',
    }),
    filterYear(year){
      console.log("filterYear")
      this.$emit('to-blank')
      this.selected_pp = undefined
      //this.fetchPAs(`?year=${year}`)
      //this.fetchPAs('')
    },
    changeImage(nav){
      try{
        let images = this.available_images
        if (nav.fast)
          images = images.filter(img=>img.validated === null)
        const img_idx = images.findIndex(img=>
          img.id == this.current_image.image.id)
        let next_img = images[img_idx+nav.next].id
        this.$emit('reset-image', [next_img])
      } catch(err){}
    },
    changeStatusPA(status){
      this.putPA([this.selected_pp.id, {status: status.name}]).then(res=>{
        this.fetchPAs('')
      })
    },
    saveImage(option){
      this.loading = true
      let curr_id = this.current_image.image.id
      let curr_pp = this.selected_pp.id
      let body = { validated: option }
      this.putImage([curr_id, curr_pp, body]).then(res=>{
        this.loading = false
        this.changeImage(this.nav_pages[2])
      })
    },
  },
}
</script>

<template>
  <div>
    <v-card-title primary-title class="pb-0">
      <v-select
        :items="['','2014', '2015', '2015', '2016', '2017', '2018', '2019']"
        label="Año"
        outlined
        class="mr-3"
        style="max-width: 100px;"
        hide-details
        @change="filterYear"
        v-model="current_year"
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
          {{item.townhall}}
        </template>
        <template v-slot:item="{ item }">
          <v-icon :color="item.status_obj.color" class="mr-2">
            {{ item.status_obj.icon }}
          </v-icon>
          {{`${item.townhall} (${item.period_pp})`}}
        </template>
      </v-select>
      <v-select
        v-if="selected_pp"
        :items="status_verif"
        label="Status Cuenta Pública"
        outlined
        class="ml-3"
        style="max-width: 260px;"
        hide-details
        item-text="text"
        item-value="name"
        return-object
        v-model="selected_pp.status_obj"
        @change="changeStatusPA"
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
          @click="$emit('reset-image', [img.id])"
        >{{img.path.substr(-6,2)}}</v-chip>
        <v-btn
          v-for="nav in nav_pages"
          color="accent"
          icon
          fab
          small
          @click="changeImage(nav)"
        >
          <v-icon>{{`fa-${nav.fast ? 'fast-' : ''}${nav.icon}`}}</v-icon>
        </v-btn>
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
  </div>
</template>