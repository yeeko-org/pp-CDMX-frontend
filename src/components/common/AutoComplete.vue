<script>

//import * as d3 from 'd3';

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
      keys: [
        {"name":"real_name", "weight": 0.4},
        {"name":"clasif_name", "weight": 0.5},
        {"name":"alter_clasifs", "weight": 0.3},
        {"name":"number_unity", "weight": 0.8},
        {"name":"prev_clasif_name", "weight": 0.7},
        {"name":"municipality", "weight": 0.2}
      ],
      rules: {
        defined_n: v => v !== undefined || 'Escribe la respuesta',
      },
    }
  },
  methods: {
    changeText(str){
      console.log("text",str)
      this.response_text=str
      this.count = 0
      if (!this.special_items) return

      if (!str && this.response){
        console.log("llego acá")
        this.filtered_items = this.all_items
        return
      }
      if(!str)
        return

      str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      var first_number = str.match(/\d+/)
      var words = str.split(/\d+|\s/)
      words = words.filter(item => item && item !== "de")
      var all_words = words.map(word=>({'count':0, 'text':word, 'is_number':false}))

      if (first_number)
        all_words.push({'count':0, 'text':first_number[0], 'is_number': true})

      var categ_hosp = this.all_items.map(hosp=>{
        var all_content = this.keys.reduce((itm_str, field)=>
          hosp[field.name] 
            ? itm_str.concat(itm_str? ' ' : '', hosp[field.name]) 
            : itm_str
        ,'')
        hosp.all_content = all_content.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "").toLowerCase()
        hosp.matches = all_words.reduce((score, word)=>{
          if(hosp.all_content.includes(word.text)){
            word.count++
            score++
            if (word.is_number && hosp.number_unity)
              score+= hosp.number_unity == word.text ? 2 : 0
          }
          return score
        },0)
        return hosp
      })
      categ_hosp = categ_hosp.filter(hosp=>hosp.matches)
      this.filtered_items = categ_hosp/*.sort((x, y)=>
         d3.descending(x.matches, y.matches))*/
      this.filtered_items.push({[this.field_text]: str, 'id':0})
      console.log(this.filtered_items)
    },
    changeValue(ev){
      console.log("val",ev)
      console.log(this.response_text)
      if (ev == 0)
        this.response_string = this.response_text
      else
        this.response_string = undefined
      this.dont_match = false
      this.emitData()
    },
    filterItems(item, queryText, itemText){
      return this.special_items ? true : this.filterOptions(item, queryText, itemText)
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
      if (!this.response && this.response_text){
        this.dont_match = true
        this.response_string = this.response_text
        this.response = 0
      }
      this.emitData()
    },
    buildItems(){
      this.all_items.push({[this.field_text]: null, 'name':'', 'id':0})
      this.filtered_items = this.all_items.filter(itm=>
        this.special_items? itm.id : itm)
    },
    emitData(){
      var new_value=this.response || this.response_string
      if (this.value != new_value){
        this.value = new_value
        this.$emit('input_change', {'model': this.model, 'value': new_value})
      }
    }
  },
  created(){
    this.buildItems()
  },
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
    :rules="[rules.defined_n]"
    :filter="filterItems"
    hide-no-data
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
        <span v-if="data.item.id==0" class="primary--text">Agregar: </span>
        {{data.item[field_text]}}
        <span v-if="data.item[field_text]==' '">{{response_text}}</span>
        <template v-if="special_items">
          <span class="grey--text text--darken-1 ml-3" v-if="data.item.total_unities<70">
            (Munic {{data.item.municipality}})
          </span>
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