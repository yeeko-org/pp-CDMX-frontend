<script>
import { mapState, mapActions, mapMutations } from "vuex";
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
      //person_email: null,
      aws_url: 'https://cdn-yeeko.s3.amazonaws.com/',
      persona_data: {},
      //step: 'initial',
      //step: 'questions',
      test_step: null,
      //test_step: 'questions',
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
      step: state => state.reports.step,
      person_email: state => state.reports.person_email,
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

          this.setStep
          (this.test_step)
        }
        else if (this.test_step){
          this.setStep
          (this.test_step)
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
    ...mapMutations({
      setStep : 'reports/SET_STEP',
      savePersonMail : 'reports/SET_PERSON_EMAIL',
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
          this.setStep
          ('questions')
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
          this.setStep
          ('final')
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
        this.setStep
        ('axes')
        //this.person_email = data.email
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
        <v-card class="pb-3 my-3" >
          <v-card-title primary-title>
            Introducción
          </v-card-title>
          <v-card-text class="subtitle-1 black--text">
            <p>
              Como parte del proyecto de colaboración entre la Secretaría Ejecutiva del Sistema Nacional Anticorrupción, las Secretarías Ejecutivas de los sistemas anticorrupción estatales y BORDE,  a continuación se presenta un breve ejercicio de priorización que constituye la segunda etapa para la generación de proyectos de cambio en materia de combate a la corrupción.
            </p>
            <p>
              En el presente ejercicio, las Secretarías Ejecutivas Estatales y organizaciones de la sociedad civil, deberán elegir y priorizar las causas y factores que contribuyen a la corrupción en cada entidad. La información para este ejercicio de priorización se tomó de la Política Nacional Anticorrupción y las políticas locales. Puedes conocer el documento en el siguiente enlace.
            </p>
            <p>
              La información que resulte de este ejercicio será analizada por BORDE, posteriormente,  se realizarán talleres participativos para analizar el diseño de los proyectos de cambio que serán ejecutados y monitoreados por los sistemas locales y organizaciones de la sociedad civil de cada entidad.
            </p>
            <p>
              La información sobre cada etapa del proceso la pueden consultar en <a href="https://borde.mx/incorruptible/" target="_blank">borde.mx/incorruptible/</a>
            </p>
          </v-card-text>
        </v-card>
        <v-form ref="personForm" v-model="person_form" lazy-validation>
          <v-card class="my-3" v-if="step == 'initial'">
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
          <v-card class="my-3">
            <v-card-title class="text-h5 font-weight-bold">
              PRIMERA PARTE. Priorización de factores
            </v-card-title>
          </v-card>
          <v-card class="my-3" v-for="axis in final_axes">
            <v-card-title primary-title class="no-wrap" style="max-width: 800px;">
              Eje {{axis.numeral}}: {{axis.short_name}}
              <br>
              Causa principal: {{axis.name}}
            </v-card-title>
            <v-card-text>
              <p class="subtitle-1">
              </p>
              <v-alert type="info" dense>
                Ordena los siguientes factores que contribuyen a esa causa desplazando de una columna a otra. Elige máximo 3 factores que creas que tengan mayor prioridad de atención.
              </v-alert>

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
          <v-card class="my-3">
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
          
          <v-card-title class="text-h5 font-weight-bold mt-3">
            SEGUNDA PARTE. Priorización de factores
          </v-card-title>
          <v-card 
            class="my-3"
            v-for="question in final_questions"
          >
            <v-card-title primary-title class="no-wrap" style="max-width: 800px;">
              {{question.text}} {{persona_data.state}}?
            </v-card-title>
            <v-card-text>
              <v-alert type="info" dense>
                Prioriza los factores desplazando cada elemento a la columna de la derecha en orden de importancia (1 es el número con mayor importancia)
              </v-alert>
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
                        <span style="text-decoration: underline;">
                          (Eje {{element.axis+1}})
                        </span>                        
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
                          (Eje {{element.axis+1}})
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
          <v-card class="my-3">
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
        <v-alert type="success" prominent  v-if="step == 'final'" class="my-2">
          Ordenamiento concluído y encuesta enviada. ¡Gracias por tu participación!
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