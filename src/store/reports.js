export const state = () => ({
  suburbs: undefined,
  townhalls: undefined,
  suburb_types: undefined,
  current_projects: undefined,
  selected_suburb: undefined,
  selected_suburb_shape: undefined,
  data_builded: false,
})

export const mutations = {
  SET_CATS(state, data){
    state.suburbs = data.suburb
    state.townhalls = data.townhall
    state.suburb_types = data.suburb_type
  },
  SET_FINAL_PROJECTS(state, reports){
    state.current_projects = reports;
    state.suburbs = state.suburbs.map(sub=>{
      try{
        sub.participation = 
          reports.find(report=>report.suburb == sub.id).total_votes /
          sub.pob_2010
      }
      catch(err){
        sub.participation = null
      }
      return sub
    })
    state.data_builded = true


  },
  SET_SELECTED_SUBURB(state, suburb_data){
    state.selected_suburb = suburb_data
  },
  SET_SUBURB_SHAPE(state, suburb_data){
    state.selected_suburb_shape = suburb_data.geo_data
      ? {
          "type": "Feature",
          "geometry": JSON.parse(suburb_data.geo_data.geo_shape),
          "properties": {
            "name": suburb_data.name
          }
        }
      : undefined
  },
}

export const getters = {
  suburbs_geo(state) {
    return state.suburbs
      ? state.suburbs.filter(sub=>{
        const geopoint = JSON.parse(sub.geo_point)
        if (geopoint){
          sub.real_geo_point = [geopoint[1],geopoint[0]]
          return sub
        }
      })
      : []
  },
  project_indicators(state) {
    return state.current_projects
      ? state.current_projects.map(proj=>{
        try{
          proj.participation = proj.total_votes / 
            state.suburbs.find(sub=>sub.id == proj.suburb).pob_2010
        }
        catch(err){
          proj.participation = null
        }
        return proj

      })
      : []
  },
}

export const actions = {

  FETCH_CATALOGS({ commit }) {
    return new Promise (resolve => {
      this.$axios.get('/geo/catalog/').then(({data})=>{
        commit("SET_CATS", data)
        return(resolve(data))
      })
    })
  },
  GET_SUBURB({ commit }, sub_id) {
    return new Promise (resolve => {
      this.$axios.get(`/geo/suburb/${sub_id}/`).then(({data})=>{
        commit("SET_SUBURB_SHAPE", data)
        return(resolve(data))
      })
    })
  },

  FETCH_FINAL_PROJECTS({commit}){
    return new Promise (resolve => {
      this.$axios.get('/project/final_project/1/').then(({data})=>{
        commit("SET_FINAL_PROJECTS", data)
        return resolve(data)
      })
    })
  },
}