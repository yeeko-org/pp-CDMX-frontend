<template>
  <v-row justify="center">
    <v-card 
      id="save_form"
      class="mx-3 mb-3"
      :class="{'ma-1': $breakpoint.is.smAndDown}"
      max-width="700" v-if="saved || want_add"
    >
      <v-card v-if="saved && !want_add" class="pa-3">
        <v-alert type="success" :value="true" class="mx-3 mt-3">
          Hemos recibido tu reporte
        </v-alert>
        <v-card-title primary-title class="text-center">
          ¿Cómo te gustaría continuar?
        </v-card-title>
        <v-card-actions>
          <v-btn color="primary" href="https://nosotrxs.org" target="_blank">
            Visitar Nosotrxs.org
          </v-btn>
          <v-btn color="primary" @click="want_add = true" outlined>
            Subir nuevo reporte
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-form 
        v-if="want_add"
        ref="data_report_form"
        lazy-validation
        @submit.prevent="save_report" 
        v-model="report_data"
        class="pa-3 black--text"
      >
        <v-card-title
          class="no-wrap"
          :class="{'pa-1': $breakpoint.is.smAndDown, 
            'pa-3': $breakpoint.is.mdAndUp}"
        >
          <span class="headline pink--text text--lighten-2 text-center">
            <span v-if="is_prof" >
              ¡Ayúdanos a mapear los hospitales y clínicas que no cuentan con los insumos necesarios para que puedas hacer tu trabajo!
            </span>
            <span v-else>
              ¡Acabemos juntxs con el desabasto de medicamentos!
            </span>
          </span>
          <p class="pt-3 mb-1 display-1 no-wrap">
            Compártenos los detalles
             {{is_prof ?'del ':'de tu '}}reporte:
          </p>
        </v-card-title>
        <v-card-text :class="{'pa-1': $breakpoint.is.smAndDown, 
          'pa-3': $breakpoint.is.mdAndUp}">
          <v-alert type="error" v-if="error_save" :value="true" class="mx-3">
            {{error_save}}
          </v-alert>
          <v-divider></v-divider>
          <supplies :is_prof="is_prof" ref="supplies"/>
          <v-divider class="mt-2"></v-divider>
          <v-col 
            cols="12"
            class="black--text title font-weight-regular pb-1 pt-2 px-0"
          >
            Datos de la clínica u hospital:
          </v-col>
          <hospital-data ref="report" v-if="true"/>
          <v-divider class="mt-2"></v-divider>
          <contact-data ref="contact" v-if="true"/>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="12" sm="8">
              <v-sheet color="deep-purple lighten-5" class="pa-2">
                Al enviarnos tu reporte aceptas el
                <v-btn 
                  color="primary"
                  @click="advice_privacy = true"
                  text 
                  class="px-1"
                  style="margin-bottom: 1px"
                  small
                >
                  Aviso de Privacidad
                </v-btn>
              </v-sheet>
            </v-col>
            <v-col class="shrink" cols="12" sm="4" align="center">
              <v-btn 
                color="success"
                large
                :disabled="!report_data || saving"
                @click="save_report"
              >
                Enviar Reporte
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-form>
    </v-card>

    <v-dialog
      v-model="advice_privacy"
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline">AVISO DE PRIVACIDAD NOSOTRXS</v-card-title>
        <v-card-text>
          <p>
            Nosotr@s por la democracia A.C., es el responsable de tratar los datos personales proporcionados en esta plataforma, los cuales serán resguardados conforme a la Ley Federal de Protección de Datos Personales en Posesión de Particulares y demás normatividad que resulte aplicable. 
          </p>
          <p>
            Nosotr@s por la democracia A. C., tiene como domicilio Gobernador José Gómez de la Cortina 21, Del. Miguel Hidalgo, Col. San Miguel Chapultepec, Ciudad de México, C.P. 11850. 
          </p>
          <p class="subtitle-2">
            Finalidades del tratamiento de los datos. 
          </p>
          <p>
            Para fines de establecer contacto con las personas, comunicar las acciones y notificar actividades que lleva a cabo la organización, se solicita nombre completo, correo electrónico y/o teléfono.  
          </p>
          <p>
            De manera adicional, los datos recabados se utilizarán para generar estadísticas e informes sobre los resultados de las acciones que lleva a cabo Nosotr@s por la democracia A. C. Esta información no estará asociada con el titular de los datos personales, por lo que no será posible identificarlo.
          </p>
          <p>
            En cumplimiento del artículo 16, último párrafo, de la Ley Federal de Protección de Datos Personales en Posesión de Particulares se informa que no se recaban datos sensibles.
          </p>
          <p>
            El medio para ejercer los derechos de acceso, rectificación, cancelación u oposición a la información provista, de conformidad con lo dispuesto en esta Ley, será vía el correo electrónico contacto@nosotrxs.org. En el mismo correo electrónico puede darse de baja de la lista de difusión o de las bases de datos de la organización. 
          </p>
          <p class="subtitle-2">
            Cambios al aviso de privacidad
          </p>
          <p>
            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de las necesidades propias de la organización del Programa o por otras causas. En caso de que exista un cambio a este aviso de privacidad, lo haremos de su conocimiento en el correo electrónico que nos proporcionó y/o en esta página web.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="advice_privacy =false"
          >
            De acuerdo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-row>
</template>


<script>

//import AddReport from "~/mixins/new_report/AddReport"
//import { mapState } from "vuex";
//import reportMixin from "~/mixins/reportMixin"
import Supplies from "./Supplies"
import HospitalData from "./HospitalData"
import ContactData from "./ContactData"

export default {
  name: 'reportMixin',
  components: {
    Supplies,
    HospitalData,
    ContactData,
  },
  //mixins: [reportMixin],
  props:{
    informer_type:{
      type: String,
      required: true,
    },
    want_add:{
      type: Boolean,
      required: true,
    },
  },  
  data(){
    return {
      report_data: false,
      personal_data: false,
      menu: false,
      saving: false,
      advice_privacy: false,
      panel: undefined,
      saved: false,
      at_least: false,
      error_save: undefined,
    }
  },
  computed:{
    /*...mapState({
      states: state => state.states,
    }),*/
    is_prof(){
      return this.informer_type == 'profesional'
    }
  },
  methods: {
    goToMap(state_id){
      if (!state_id) return
      setTimeout(() => {
        this.$vuetify.goTo('#MapCard', 
          {duration: 600, offset: 30, easing:'easeInOutCubic'})
        this.$emit('pinMap', state_id)
      }, 1200)
    },
    goToForm(offset=30, elm_id='#save_form'){
      this.$vuetify.goTo(elm_id, 
        {duration: 400, offset: offset, easing:'easeInOutCubic'})
    },
    save_report() {
      this.saving = true
      this.$ga.event({
        eventCategory: 'click',
        eventAction: 'try_send',
      })      
      if (this.$refs.data_report_form.validate()){
        var rp = this.$refs.contact.loadData()
        var rph = this.$refs.report.buidReport()
        const data_supp = this.$refs.supplies.loadData()

        var supplies = data_supp.supplies

        rp = {...rp, ...rph}
        rp.disease = data_supp.disease
        console.log(rp)

        rp.informer_type = this.informer_type

        rp.supplies = supplies.map(sp=>({"medicine_type": sp.droug_type.name,
            "medicine_name_raw": sp.medication_name}))
        console.log(rp)
        

        /*if (!user.email && !user.phone){
          this.goToForm(60, '#panel_user')
          this.saving = false
          this.$ga.event({
            eventCategory: 'click',
            eventAction: 'error_form',
          })
          return
        }*/
        
        this.$store.dispatch('reports/SAVE_REPORT', rp).then((response)=>{
          if (response.status > 201){
            this.error_save = JSON.stringify(response.data)
            this.goToForm(-60, '#save_form')
            this.saving = false
            this.$ga.event({
              eventCategory: 'click',
              eventAction: 'error_form',
            })
            return
          }
          this.want_add = false
          this.saved = true
          this.goToForm(100)
          this.goToMap(rp.state)

          this.$refs.data_report_form.reset()
          this.report={}
          this.report_data = true
          this.saving = false
          this.$ga.event({
            eventCategory: 'click',
            eventAction: 'sended',
          })
        }).catch(error =>{
          console.log(error)
          this.$ga.event({
            eventCategory: 'click',
            eventAction: 'error_form',
          })          
          this.saving = false
        });
      }
      else{
        this.$ga.event({
          eventCategory: 'click',
          eventAction: 'error_form',
        })
        var el_err = this.$refs.data_report_form.inputs.find(x=>!x.valid)
        this.$vuetify.goTo(el_err.$el, 
          {duration: 200, offset: 10, easing:'easeInOutCubic'})
        this.saving = false
      }

    }
  },
  created(){
  },
}
</script>