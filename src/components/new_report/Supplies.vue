<template>
  <div>
    <v-col  cols="12"
            class="black--text title font-weight-regular pb-4 px-0"
    >Indica los insumos faltantes:</v-col>    
    <template v-for="(supp, idx) in supplies">
      <v-subheader :class="{'pl-0': supplies.length > 1}" style="height: 14px" 
        class="mt-2"
        v-if="supplies.length > 1"
      >
        <v-tooltip top v-if="supplies.length > 1">
          <template v-slot:activator="{ on }">
            <v-btn 
              v-on="on"
              color="red"
              icon
              @click="deleteSupp(idx)"
              class="mr-2"
            >
              <v-icon color="red">fa-trash-alt</v-icon>
            </v-btn>
          </template>
          <span>Eliminar insumo</span>
        </v-tooltip>
        Insumo {{idx+1}}:
      </v-subheader>
      <v-row class="mx-0" align="center">
        <v-icon class="pb-6">fa-medkit</v-icon>
        <v-col class="shrink pb-8 subtitle-1" cols="10" sm="4" xs="5">
          ¿Qué insumo falta?
        </v-col>
        <v-col 
          md="6"
          sm="5" 
          xs="12" 
          class="pa-0" 
          :class="{'ml-8': $breakpoint.is.mdAndDown}"
        >
          <v-select
            label="Elige una opción"
            outlined
            style="width: 250px;"
            item-value="options"
            v-model="supp.droug_type"
            :items="medicine_types"
            :rules="[rules.required]"
          >
            <template v-slot:selection="{ item }">
              <v-icon class="mr-2"> {{item.options.icon}} </v-icon>
              {{ item.options.public_name }}
            </template>
            <template v-slot:item="data">
              <v-list-item-avatar >
                <v-icon>{{data.item.options.icon}}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-html="data.item.options.public_name">
                </v-list-item-title>
              </v-list-item-content>
            </template>                    
          </v-select>
        </v-col>
      </v-row>
      <v-text-field
        v-if="supp.droug_type"
        name="droug_name"
        id="droug_name"
        :prepend-icon="supp.droug_type.icon"
        outlined
        :label="supp.droug_type.question"
        v-model="supp.medication_name"
        :rules="[rules.required]"
      ></v-text-field>
    </template>
    <v-btn 
      color="primary"
      class="ml-8 mb-2"
      outlined
      @click="addSupply()"
    >
      Agregar insumo
    </v-btn>
    <v-text-field
      v-if="!is_prof && showDisease()"
      name="disease"
      id="disease"
      prepend-icon="fa-stethoscope"
      outlined
      class="mt-3"
      label="¿Cuál es el padecimiento principal de la enfermedad?"
      v-model="disease"
      :rules="[rules.required]"
    ></v-text-field>
  </div>
</template>

<script>

//import { mapState } from "vuex";
import reportMixin from "~/mixins/reportMixin";

export default {
  name: 'AddReport',
  components: {
  },
  mixins: [reportMixin],
  directives: {
  },
  props:{
    is_prof:{
      type: Boolean,
      required: false,
      default: true,
    },
  },  
  data(){
    return {
      supplies: [],
      disease: undefined,
      rules: {
        required: value => !!value || 'Campo Requerido.',
      },
      medicine_types : [
        {'name':'Medicamento',
          'options': {
            'question':'¿Qué medicamento hizo falta?', 
            'icon':'fa-pills',
            'public_name':'Medicamento',
            'name':'medicamento',
          }
        },
        {'name':'Vacuna',
          'options': {
            'question':'¿Qué vacuna es?',
            'icon':'fa-syringe',
            'public_name':'Vacuna',
            'name':'vacuna',
          }
        },
        {'name':'Material de curación',
          'options': {
            'question':'¿Qué material hizo falta?', 
            'icon':'fa-band-aid',
            'public_name':'Material de curación',
            'name':'material',
          }
        },
        {
          'name':'Otro',
          'options': {
            'question':'Describe el insumo faltante', 
            'icon':'fa-crutch',
            'public_name':'Otro',
            'name':'otro',
          }
        },
      ],      
    }
  },
  methods: {
    addSupply(){
      this.supplies.push({"droug_type":undefined, "medication_name": undefined})
    },
    deleteSupp(idx){
      this.supplies.splice(idx, 1)
    },
    showDisease(){
      return !!(this.supplies.find(sup=>sup.droug_type 
        && sup.droug_type.name != 'vacuna'))
    },
    loadData(){
      return {'supplies' : this.supplies, 'disease': this.disease}
    },
  },
  computed:{
  },
  created(){
    this.addSupply()
  },
}
</script>

<style lang="scss" scoped>
</style>