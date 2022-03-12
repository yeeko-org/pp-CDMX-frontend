<script>
import { mapState, mapActions } from "vuex";
import draggable from 'vuedraggable'

export default {
  layout: 'reports',
  name: 'Home',
  components: {
    draggable
  },
  data(){
    return {
      informer_type: '',
      want_add: false,
      is_mounted: false,
      show_map: false,
      start: false,
      person_form: false,
      touched: false,
      person_email: null,
      aws_url: 'https://cdn-yeeko.s3.amazonaws.com/',
      persona_data: {},
      step: 'initial',
      test_step: null,
      //test_step: 'axes',
      //step: 'axes',
      //step: 'questions',
      final_axes: [],
      final_questions: [],
      states: [
        "Chiapas",
        "Chihuahua",
        "Colima",
        "Michoacán",
        "Nuevo León",
        "Yucatán",
      ],
      origins:[
        'SESEA',
        'Sociedad Civil'
      ],
      rules:{
        user_name: (v) =>  !!v || 'Es necesario agregar tu nombre',
        full_name: (v) =>  !!v || 'Es necesario agregar un correo',
        password: (v) => !!v || 'Es necesario agregar tu contraseña',
        required: (value) => !!value || 'Valor Requerido.',
        min: (value) => (!!value ? value.length >= 8 : false) || 'Mínimo 8 caracteres',      
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Escribe un correo válido'
        }
      },
      list2: [],
    }
  },
  computed:{
    ...mapState({
      axes: state => state.reports.axes,
      causes: state => state.reports.causes,
      questions: state => state.reports.questions,
    }),
  },
  mounted(){
    this.is_mounted = true
    this.fetchCatalogs().then((data)=>{
      this.$nextTick( () =>{
        this.show_map = true
        this.calculateAxes()
        if (this.test_step == 'questions'){
          const final_causes = this.causes.filter((cause, idx)=>idx < 9)
          this.final_questions = this.questions.map(question=>{
            return {...question, ...{
              causes: [...final_causes],
              causes_count: final_causes.length,
              selected_causes: []
            }}
          })
          this.step = this.test_step
        }
        else if (this.test_step){
          this.step = this.test_step
        }
      })
    })
  },
  watch:{
    informer_type(type_re){
      //this.goToForm()
      this.want_add = true
      this.$ga.event({
        eventCategory: 'click',
        eventAction: 'select_profile',
      })
    }
  },
  methods: {
    ...mapActions({
      fetchCatalogs: 'reports/FETCH_CATALOGS_SESNA',
      savePersona: 'reports/SAVE_PERSONA',
      saveChooses: 'reports/SAVE_CHOOSES',
    }),
    goToForm(elem=60, offs=30){
      this.$vuetify.goTo(elem, 
        {duration: 400, offset: 30, easing:'easeInOutCubic'})
    },
    log: function(evt) {
      window.console.log(evt);
    },
    calculateAxes(){
      this.final_axes = this.axes.map(ax=>{
          return {...ax, ...{
            causes: this.causes.filter(cause=> cause.axis == ax.id),
            //causes: [...this.list1],
            selected_causes: [],
          }}
        })
    },
    saveSelecteds(){
      this.touched = true
      const some_missing = this.final_axes.some(axis=>
        axis.selected_causes.length < 2
          || axis.selected_causes.length > axis.max_election
      )
      if (!some_missing){
        let final_causes = this.final_axes.reduce((arr, axis)=>(
          [...arr, ...axis.selected_causes]
        ),[])
        const chooses = final_causes.map(cause=>({
          cause: cause.id,
          persona: this.person_email || 'ricardo@yeeko.org'
        }))

        this.saveChooses({chooses: chooses}).then(res=>{
          this.final_questions = this.questions.map(question=>{
            return {...question, 
              ...{
                causes: [...final_causes],
                causes_count: final_causes.length,
                selected_causes: []}
              }
          })
          this.step = 'questions'
          this.goToForm()
          this.touched = false
        })
      }
      else{
        setTimeout(()=> {
          this.goToForm('#alert')
        }, 200);        
      }
    },
    saveFinal(){
      //this.step = 'final'
      this.touched = true
      console.log(this.final_questions)
      const some_missing = this.final_questions.some(question=>
        !!question.causes.length
      )
      if (!some_missing){

        let final_chooses = this.final_questions.reduce((arr, question)=>{
          const chooses = question.selected_causes.map((cause, idx)=>(
            {
              question: question.id,
              value: idx+1,
              persona: this.person_email || 'ricardo@yeeko.org',
              cause: cause.id
            }
          ))
          return [...arr, ...chooses]
        },[])
        this.saveChooses({chooses: final_chooses}).then(res=>{
          this.step = 'final'
          this.goToForm()
        })
      }
      else{
        setTimeout(()=> {
          this.goToForm('#alert-incomplete')
        }, 200);
      }
    },
    sendData(){
      this.savePersona(this.persona_data).then(data=>{
        console.log(data)
        this.step = 'axes'
        this.person_email = data.email
        this.goToForm()      
      })
    },
  },  
}
</script>

<template>
  <v-flex id="app-width" fluid style="width: 100%" v-if="show_map">
    <v-row class="mx-0">
      <v-col
        cols="12"
        class="px-0 px-sm-3"
        max-width="200"
        v-if="is_mounted" 
        :order="($breakpoint.is.xsOnly ? 2 : 1)"
      >
        <v-card class="pb-6">
          <v-card-title primary-title>
            Introducción
          </v-card-title>
          <v-card-text class="subtitle-1 black--text">
            <p>
              Como parte de las actividades de fortalecimiento de la colaboración entre sociedad civil y la Secretaría Ejecutiva del Sistema Estatal Anticorrupción, se diseñarán proyectos de cambio que llevarán a cabo las instituciones del Comité Coordinador del Sistema Estatal Anticorrupción.
            </p>
            <p>
              Al respecto, el primer paso es elegir, en conjunto con la Secretaría Ejecutiva, las causas de la corrupción más importantes de resolver. Las causas para este ejercicio de priorización, se tomaron de la Política Nacional Anticorrupción. Puedes conocer el documento en el siguiente <a href="https://borde.mx">enlace.</a>
            </p>
            <p>
              Una vez elegidas las causas, se realizarán talleres participativos para analizar el diseño de los proyectos de cambio que serán ejecutados y monitoreados por las mismas Secretarías y sociedad civil locales. 
            </p>
          </v-card-text>
        </v-card>
        <v-form ref="personForm" v-model="person_form" lazy-validation>
          <v-card class="mt-3" v-if="step == 'initial'">
            <v-card-title primary-title>
              Datos de contacto:
            </v-card-title>
            <v-card-subtitle >
              Llena los datos para poder comenzar
            </v-card-subtitle>
            <v-card-text>
              <v-text-field
                name="name"
                label="Nombre Completo"
                prepend-icon="fa-person"
                outlined
                id="name"
                _style="max-width: 500px;"
                v-model="persona_data.name"
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                label="Correo electrónico"
                name="email"
                outlined
                prepend-icon="fa-envelope"
                type="email"
                _style="max-width: 500px;"
                v-model="persona_data.email"
                :rules="[rules.email, rules.user_name]"
              ></v-text-field>
              <v-select
                :items="states"
                _v-model="value"
                prepend-icon="fa-location"
                outlined
                v-model="persona_data.state"
                :rules="[rules.required]"
                _style="max-width: 500px;"
                label="Elige el estado que formas parte"
              ></v-select>
              <v-select
                :items="origins"
                _v-model="value"
                prepend-icon="fa-location"
                outlined
                v-model="persona_data.origin"
                _style="max-width: 500px;"
                :rules="[rules.required]"
                label="¿Cuál es tu origen?"
              ></v-select>
              <v-text-field
                v-if="persona_data.origin == 'SESEA'"
                name="email"
                prepend-icon="fa-building"
                v-model="persona_data.cargo"
                label="Cargo en la institución"
                _style="max-width: 500px;"
                outlined
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-else
                name="email"
                prepend-icon="fa-building"
                v-model="persona_data.institution"
                label="Institución"
                _style="max-width: 500px;"
                outlined
                :rules="[rules.required]"
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="pb-6">
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                @click="sendData"
                :disabled="!person_form"
              >Comenzar encuesta</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-form>
        <template  v-if="step == 'axes'">
          <v-card class="mt-3" v-for="axis in final_axes">
            <v-card-title primary-title>
              Eje {{axis.numeral}}. {{axis.short_name}}", cuya causa principal es "{{axis.name}}"
            </v-card-title>
            <v-card-text>
              <p>
                Ordena las siguientes causas subyacentes, elige hasta {{axis.max_election}}
                que creas que tengan mayor prioridad de atención:
              </p>

              <v-row>
                <v-col cols="6">
                  <v-card outlined class="pa-3">
                    <h3>Lista de Factores que contribuyen</h3> 
                    <draggable
                      class="list-group"
                      :list="axis.causes"
                      _disabled="axis.selected_causes.length >= axis.max_election"
                      group="people"
                      @change="log"
                    >
                      <v-card
                        color="blue lighten-4"
                        class="list-group-item pa-3 my-3 move"
                        _:class="axis.selected_causes.length >= axis.max_election ? '' : ''"
                        v-for="(element, index) in axis.causes"
                        :key="element.id"
                      >
                        {{ element.text }} 
                      </v-card>
                    </draggable>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card outlined class="pa-3">
                    <h3>Seleccionados (min. 2, máx. {{axis.max_election}})</h3> 
                    <v-alert
                      v-if="axis.selected_causes.length < 2 && touched"
                      type="error"
                      outlined
                      id="alert"
                    >
                      Debes elegir al menos 2 factores
                    </v-alert>
                    <draggable 
                      class="list-group"
                      :list="axis.selected_causes"
                      group="people"
                      @change="log"
                    >
                      <v-card
                        color="green lighten-3"
                        class="list-group-item pa-3 my-3 move"
                        v-for="(element, index) in axis.selected_causes"
                        :key="element.id"
                      >
                        {{ element.text }}
                      </v-card>
                      <div
                        v-if="!axis.selected_causes.length" 
                        style="height: 200px;">
                      </div>
                    </draggable>
                    <v-alert
                      v-if="axis.selected_causes.length > axis.max_election"
                      type="error"
                      outlined
                      id="alert"
                    >
                      Puedes elegir máximo {{axis.max_election}} factores
                    </v-alert>
                  </v-card>
                </v-col>
              </v-row>
        
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                large
                @click="saveSelecteds()"
              >Guardar elección</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </template>
        <template  v-if="step == 'questions'">
          <v-card 
            class="mt-3"
            v-for="question in final_questions"
          >
            <v-card-title primary-title>
              {{question.text}} {{persona_data.state}}?
               (Pasa la lista del lado izquierdo y ordénala)
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col 
                  :cols="question.causes.length == question.causes_count
                    ? ($breakpoint.is.xsOnly ? 7 : 8)
                    : !question.causes.length
                      ? ($breakpoint.is.xsOnly ? 4 : 3)
                      : question.causes.length < 4
                        ? ($breakpoint.is.xsOnly ? 5 : 4)
                        : question.selected_causes.length < 4
                          ? ($breakpoint.is.xsOnly ? 7 : 8)
                          : 6"
                  class="pl-1 pl-sm-3 pr-2 pr-sm-3"
                >
                  <v-card outlined class="pa-1 pa-sm-3">
                    <h3>Factores que priorizaste</h3>
                    <v-alert
                      v-if="question.causes.length && touched"
                      type="error"
                      outlined
                      id="alert-incomplete"
                    >
                      Debes pasar todos los elementos
                    </v-alert>                    
                    <draggable
                      class="list-group"
                      :list="question.causes"
                      group="people"
                      @change="log"
                    >
                      <v-card
                        color="blue lighten-4"
                        class="list-group-item pa-3 my-3 move"
                        v-for="(element, index) in question.causes"
                        :key="element.id"
                      >
                        {{ element.text }}
                      </v-card>
                    </draggable>
                  </v-card>
                </v-col>
                <v-col 
                  :cols="question.causes.length == question.causes_count
                    ? ($breakpoint.is.xsOnly ? 5 : 4)
                    : !question.causes.length
                      ? ($breakpoint.is.xsOnly ? 8 : 9)
                      : question.causes.length < 4
                        ? ($breakpoint.is.xsOnly ? 7 : 8)
                        : question.selected_causes.length < 4
                          ? ($breakpoint.is.xsOnly ? 5 : 4)
                          : 6"
                  class="pr-1 pr-sm-3 pl-2 pl-sm-3"
                >
                  <v-card outlined class="pa-1 pa-sm-3">
                    <h3>Factores ordenados:</h3> 
                    <draggable
                      class="list-group"
                      :list="question.selected_causes"
                      group="people"
                      @change="log"
                    >
                      <v-card
                        color="green lighten-3"
                        class="list-group-item pa-3 my-3 move"
                        v-for="(element, index) in question.selected_causes"
                        :key="element.id"
                      >
                        <b class="mr-2 text-h6">
                          {{ index + 1 }}
                        </b>
                        {{ element.text }}
                        <span style="text-decoration: underline;">
                          (eje {{element.axis+1}})
                        </span>
                      </v-card>
                      <div
                        v-if="!question.selected_causes.length" 
                        style="height: 200px;">
                      </div>
                    </draggable>
                  </v-card>
                </v-col>
              </v-row>
        
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                large
                @click="saveFinal()"
              >Guardar elección</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </template>
        <v-alert type="success" prominent  v-if="step == 'final'">
          Ordenamiento concluído
        </v-alert>
      </v-col>
    </v-row>
  </v-flex>
</template>

<style lang="scss">
@import '../assets/util.scss';
.white-back {
  background: rgba(256, 256, 256, 0.15);
}
.up-report{
  margin-top : -40px !important;
}
.move{
  cursor: move;
}

</style>