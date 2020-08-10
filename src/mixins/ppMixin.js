import { mapMutations, mapActions } from "vuex";

var ppMixin = {
  data(){
  return {
  }
  },
  methods:{
    ...mapMutations({
      setCurrentSeccion2 : 'reports/SET_SECTION',
    }),
    ...mapActions({
      setCurrentSeccion : 'reports/CHANGE_SECTION',
    }),
    propIntersect(entries, observer, isIntersecting){
      try{
        let section_id = entries[0].target.attributes['section'].value
        this.setCurrentSeccion([section_id, isIntersecting])
      }
      catch(err){
        console.log(err)
      }
    },
  }
}

export default ppMixin;
