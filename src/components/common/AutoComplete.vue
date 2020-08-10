<script>

import { mapActions } from "vuex";

export default {
  name: 'AutoComplete',
  props:{
    all_items:{
      type: Array,
      required: true,
    },
    model:{
      type: String,
      required: true,
    },
    special_items:{
      type: Boolean,
      required: false,
      default: false,
    },
    label:{
      type: String,
      required: false,
      default: 'Escribe/Elige una opción',
    },
    field_text:{
      type: String,
      required: true,
    },
    special_field:{
      type: String,
      required: false,
      default: '_',
    },
    icon:{
      type: String,
      required: false,
      default: 'text_fields',
    },
  },
  data(){
    return {
      dont_match: undefined,
      response_string: undefined,
      response_text: undefined,      
      filtered_items: [],
      response: undefined,
      count: 0,
      rules: {
        defined_n: v => v !== undefined || 'Escribe la respuesta',
      },
    }
  },
  methods: {
    ...mapActions({
      changeSuburbFound: 'reports/CHANGE_SUBURB_FOUND'
    }),
    changeText(str){
      console.log("text",str)
      this.response_text=str
      this.count = 0
      //if (!this.special_items) return

      if (!str && this.response){
        console.log("llego acá")
        this.filtered_items = this.all_items
        return
      }
      if(str ? str.length < 3 : true){
        return
      }
      str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
      //var first_number = str.match(/\d+/)
      var words = str.split(/\d+|\s/)
      console.log(Date.now())


      //words = words.filter(item => item && item !== "de" && item !== "colonia")
      var all_words = words//= words.map(word=>({'count':0, 'text':word}))
      console.log(all_words)
      var categ_items = this.all_items.map(item=>{
        item.matches = all_words.reduce((score, word, idx)=>{
          if (!item)
            console.log(item)
          if(item.name.includes(word)){
            score+=0.8
            if(item.townhall_obj.name_upper.includes(word.text)){
              score+=0.3
            }          
            if(item.st_obj.name.includes(word.text)){
              score+=0.1
            }
            if (item.townhall_obj.name_upper.includes(str)){
              score+=0.5
            }
          }          
          return score
        },0.0)
        return item
      })
      //console.log(categ_items)
      categ_items = categ_items.filter(item=>item.matches>0)
      this.filtered_items = categ_items.sort((x, y)=>
        this.descending(x.matches, y.matches))
      //console.log(this.filtered_items)
      console.log(Date.now())
      console.log(this.filtered_items)

    },
    changeValue(ev){
      console.log("val",ev)
      this.dont_match = false
      this.emitData()
    },

    descending(a, b) {
      return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    },

    filterItems(item, queryText, itemText){
      return true /*this.special_items 
        ? true 
        : this.filterOptions(item, queryText, itemText)*/
    },
    filterOptions(item, queryText, itemText){
      if (item.id == 0) return !this.count
      const complete_name = itemText.toLowerCase()
      const other_names = item[this.special_field]
        ? item[this.special_field].toLowerCase() : ''
      const name = item.name.toLowerCase()
      const searchText = queryText.toLowerCase()
      var found = complete_name.indexOf(searchText) > -1 ||
      name.indexOf(searchText) > -1  || other_names.indexOf(searchText) > -1
      if (found) this.count++
      return found
    },
    blurInput(str){
      console.log("blur",str)
      this.emitData()
    },
    buildItems(){
      this.filtered_items = this.all_items.filter(itm=>
        this.special_items ? itm.id : itm)
    },
    emitData(){
      var new_value=this.response
      if (this.value != new_value){
        this.value = new_value
        this.changeSuburbFound(new_value)
        //this.$emit('input_change', {'model': this.model, 'value': new_value})
      }
    }
  },
  created(){
    this.buildItems()
  },
  mounted(){
    console.log(this.filtered_items)
  }
}
</script>

<template>
  <v-autocomplete
    clearable
    v-model="response"
    class="mt-2"
    :items="filtered_items"
    outlined
    :label="label"
    :name="model"
    item-value="id"
    :item-text="field_text"
    @update:search-input="changeText($event)"
    @blur="blurInput($event)"
    @change="changeValue($event)"
    :filter="filterItems"
  >
    <template v-slot:selection="data">
      <span>
        <b v-if="special_items">{{data.item.prev_clasif_name}}</b>
        {{response_string || data.item[field_text]}}
        <span 
          class="grey--text text--darken-1"
          v-if="data.item.clasif_name && special_items"
        >
          ({{data.item.clasif_name}})
        </span>
      </span>
    </template>
    <template v-slot:item="data">
      <div class="my-2">
        <b v-if="special_items">{{data.item.prev_clasif_name}}</b>
        <span v-if="true">{{data.item.st_obj.emoji}}</span>
        <v-icon v-else color="primary">fa-{{data.item.st_obj.icon}}</v-icon>
        {{data.item[field_text]}}
        <span class="grey--text text--darken-1 ml-2">
          ({{data.item.townhall_obj.name}})
        </span>
        <template v-if="special_items">
          <br>
          <span >{{data.item.clasif_name}}</span>
        </template>
      </div>
    </template>
  </v-autocomplete>
</template>


<style lang="scss" scoped>
.up-report{
  margin-top : -150px;
}
</style>