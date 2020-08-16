import { mapMutations, mapActions } from "vuex";
import * as d3 from 'd3';

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
    format_perc(v, dec=1){
      return (!Number.isNaN(v)) ? d3.format(`.${dec}f`)(v) : '-'
    },    
    format_thous(v, dec=1){
      return (!Number.isNaN(v)) ? d3.format(',')(v) : '-'
    },
  }
}

export default ppMixin;
