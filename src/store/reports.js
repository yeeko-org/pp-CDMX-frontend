import * as d3 from 'd3';

export const state = () => ({
  suburbs: undefined,
  townhalls: undefined,
  suburb_types: undefined,
  current_projects: undefined,
  selected_suburb: undefined,
  over_suburb: undefined,
  selected_suburb_shape: undefined,
  suburb_id: undefined,
  current_section: {},
})

export const mutations = {
  SET_CATS(state, data){
    state.suburbs = data.suburb
    state.townhalls = data.townhall.sort((x, y)=>
        d3.descending(x.name, y.name))
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
  },
  SET_SELECTED_SUBURB(state, [suburb_data, is_geo=false]){
    if (is_geo)
      state.over_suburb = suburb_data
    else
      state.selected_suburb = suburb_data
  },
  SET_SUBURB_ID(state, sub_id){
    state.suburb_id = sub_id
  },
  SET_SECTION(state, [section_name, value]){
    state.current_section[section_name] = value
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
  active_section(state) {
    let cs = state.current_section
    if (cs["intro"])
      return 0
    else if (cs["search"])
      return 1
    else if (cs["map"])
      return 2
    else
      return "wacha"
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
  GET_SUBURB({ commit }, [sub_id, is_geo=true]) {
    return new Promise (resolve => {
      commit("SET_SUBURB_SHAPE", {})
      this.$axios.get(`/geo/suburb/${sub_id}/`).then(({data})=>{
        commit("SET_SELECTED_SUBURB", [data, is_geo])
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
  CHANGE_SECTION({commit}, data){
    commit("SET_SECTION", data)
  },  
  CHANGE_SUBURB_FOUND({commit, dispatch}, sub_id){
    commit("SET_SUBURB_ID", sub_id)
    dispatch("GET_SUBURB", [sub_id, false])
  },  
}