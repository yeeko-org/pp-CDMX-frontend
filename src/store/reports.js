export const state = () => ({
  suburbs: undefined,
  townhalls: undefined,
  suburb_types: undefined,
  all_reports: undefined,
})

export const mutations = {
  SET_CATS(state, data){
    state.suburbs = data.suburb
    state.townhalls = data.townhalls
    state.suburb_types = data.suburb_types
    //state.institutions = institutions;
  },
  SET_REPORTS(state, reports){
    state.all_reports = reports;
  },

}
export const actions = {

  async FETCH_CATALOGS ({ commit }) {
    return new Promise (resolve => {
      this.$axios.$get('/geo/catalog/').then((data)=>{
        console.log(data)
        commit("SET_CATS", data)
      })
    })

  },
  async FETCH_CATALOGS2 ({ commit }) {
    const data = await this.$axios.$get('/desabasto/catalog/')
    commit("SET_INSTITUTIONS", data.institutions)
  },

  FETCH_REPORTS({commit}, new_data){
    return new Promise (resolve => {
      this.$axios.get('/desabasto/reports/', new_data).then(({data})=>{
        commit("SET_REPORTS", data)
        return resolve(data)
      })
    })
  },

  async FETCH_HOSPITALS ({ commit }, params) {
  	console.log(params)
    const data = await this.$axios
    	.$get(`/desabasto/clues/?institution=${params.institution}&state=${params.state}`)
   	//commit("SET_HOSPITALS", data.results)
    return data
  },
  SAVE_REPORT ({ commit }, new_data) {
    return new Promise (resolve => {
      this.$axios.post('/desabasto/report/', new_data).then(({data})=>{
        return resolve(data)
      }).catch(({response}) => {
        console.log(response)
        return resolve(response)
      })
    })
  },
}