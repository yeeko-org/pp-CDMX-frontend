<template>
  <div>
    <v-col 
      cols="12"
      class="black--text title font-weight-regular pb-0 pt-2 px-0"
    >
      Construye comunidad con Nosotrxs:
    </v-col>
    <v-switch
      
      v-model="contact_data.accept"
      @change="openPanel($event)"
    >
      <template v-slot:label>
        <span class="black--text subtitle-1">Quiero darle seguimiento al reporte</span>
      </template>
    </v-switch>
    <v-expansion-panels v-model="panel" v-if="contact_data.accept" id="panel_user" readonly>
      <v-expansion-panel>
        <v-expansion-panel-header 
          disable-icon-rotate
          class="subtitle-2"
          :class="{'orange--text':at_least, 'px-2': $breakpoint.is.xs}"
        >
          Deja al menos un dato de contacto
          <span class="grey--text ml-3">(Serás parte de nuestra comunidad)</span>
          <template v-slot:actions>
            <v-icon color="primary">fa-users</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content :class="{'margin-minus': $breakpoint.is.xs}">
          <v-text-field
            name="email"
            id="email"
            prepend-icon="fa-envelope-open-text"
            outlined
            label="Correo Electrónico"
            v-model="contact_data.email"
            :rules="[true ? rules.email: '']"
          ></v-text-field>
          <v-text-field
            name="phone"
            id="phone"
            prepend-icon="fa-mobile-alt"
            hint="escribe los 10 dígitos"
            outlined
            v-mask="mask2"
            label="Teléfono de contacto"
            v-model="contact_data.phone"
          ></v-text-field>
          <v-text-field
            name="first_name"
            id="first_name"
            prepend-icon="fa-user-circle"
            outlined
            label="Nombre (opcional)"
            v-model="contact_data.informer_name"
          ></v-text-field>
          <v-sheet color="grey lighten-3" class="pa-2">
            Tus datos estarán protegidos
          </v-sheet>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-switch v-model="personal_data" class="mt-0" v-if="false">
      <template v-slot:label>
        <span class="black--text subtitle-1">
          Dejar datos de contacto
        </span>
      </template>
    </v-switch>

  </div>
</template>


<script>

import { mask } from 'vue-the-mask'


export default {
  name: 'ContactData',
  directives: {
    mask,
  },
  props:{
  },  
  data(){
    return {
      contact_data: {},
      personal_data: false,
      panel: undefined,
      at_least: false,
      mask2: '## #### ####',
      rules: {
        required: value => !!value || 'Campo Requerido.',
        defined_n: v => v !== undefined || 'Escribe la respuesta',
        min: value => value.length >= 6 || 'Mínimo 6 caracteres',
        min_phone: v => v.length >= 10 || 'Debes colocar 10 dígitos',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (!!value || pattern.test(value)) || !!this.contact_data.phone || 'El correo no es válido'
        }
      },
    }
  },
  computed:{
  },
  methods: {
    openPanel(ev){
      setTimeout(() => {
        this.panel = this.panel === 0 ? undefined : 0;
        //this.overlay = false
      }, 200)      
    },
    loadData(){
      return this.contact_data
    },
    validate_phone(v) {
      return () => (v.phone ? v.phone >= 12 : true) || !!this.contact_data.email || 'Debes colocar 10 dígitos'
    },
    goToForm(offset=30, elm_id='#save_form'){
      this.$vuetify.goTo(elm_id, 
        {duration: 400, offset: offset, easing:'easeInOutCubic'})
    },
  },
}
</script>

<style lang="scss">
.up-report{
  margin-top : -150px;
}
.margin-minus{
  margin: 0px -10px;
}
</style>