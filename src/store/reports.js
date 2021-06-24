import * as d3 from 'd3';

export const state = () => ({
  suburbs: undefined,
  townhalls: undefined,
  suburb_types: undefined,
  categories: undefined,
  current_projects: undefined,
  selected_suburb: undefined,
  over_suburb: undefined,
  selected_suburb_shape: undefined,
  suburb_id: undefined,
  current_section: {},
  data_viz: undefined,
  public_accounts: undefined,
  curr_pa_idx: undefined,
  pa_in_review: undefined,
  periods: undefined,
})

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

export const mutations = {
  SET_CATS(state, data){
    state.suburbs = data.suburb
    state.townhalls = data.townhall.slice().sort((x, y)=>
        d3.ascending(x.short_name, y.short_name))
    state.suburb_types = data.suburb_type
    state.periods = data.period
    state.categories = data.categories.map((cat,idx)=>{
      cat.color=d3.schemeDark2[idx]
      return cat
    })
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
  SET_DATA_VIZ(state, data){
    state.data_viz = data
  },
  SET_PUBLIC_ACCOUNTS(state, public_accounts){
    state.public_accounts = public_accounts
    if (!state.curr_pa_idx)
      state.curr_pa_idx = public_accounts.findIndex(pa => !pa.match_review)
  },
  UPDATE_IMAGE(state, [img_data, pp_id]){
    let pp_idx = state.public_accounts.findIndex(pa=> pa.id == pp_id)
    //console.log(state.public_accounts[pp_idx])
    let pp_images = state.public_accounts[pp_idx].pp_images
    //console.log(pp_images)
    let img_idx = pp_images.findIndex(img=> img_data.id==img.id)
    pp_images.splice(img_idx, 1, img_data)
    //console.log(pp_images)
    //state.public_accounts[.splice(pp_idx, 1, pp_images)
    state.public_accounts[pp_idx].pp_images =  pp_images
    //console.log(state.public_accounts[pp_idx])
    //console.log(state.public_accounts[pp_idx].pp_images[img_idx])

  },
  UPDATE_PA(state, [status, pa_id]){
    let pa_idx = state.public_accounts.findIndex(pa=> pa.id == pa_id)
    //console.log(state.public_accounts[pp_idx])
    state.public_accounts[pa_idx].status = status
  },
  SET_PA_IN_REVIEW(state, public_account){
    state.pa_in_review = public_account
  },
  SET_NEXT_PA_IDX(state, curr_idx){
    state.curr_pa_idx = state.public_accounts.findIndex(
      (pa, idx) => !pa.match_review && idx > curr_idx )
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

  FETCH_FINAL_PROJECTS({commit}, period){
    return new Promise (resolve => {
      this.$axios.get(`/project/final_project/period/${period}/`).then(({data})=>{
        commit("SET_FINAL_PROJECTS", data)
        return resolve(data)
      })
    })
  },
  FETCH_DATA_VIZ({commit}){
    return new Promise (resolve => {
      this.$axios.get('/public_account/amount_variation/').then(({data})=>{
        commit("SET_DATA_VIZ", data)
        return resolve(data)
      })
    })
  },
  GET_IMAGE({commit}, img_id){
    return new Promise (resolve => {
      this.$axios.get(`/public_account/image/${img_id}/refs/`).then(({data})=>{
        return resolve(data)
      })
    })
  },
  GET_NEXT({commit}){
    return new Promise (resolve => {
      this.$axios.get('/public_account/next/').then(({data})=>{
        return resolve(data)
      })
    })
  },
  POST_NEXT({commit}, curr_data){
    return new Promise (resolve => {
      this.$axios.post('/public_account/next/', curr_data).then(({data})=>{
        //commit("SET_FINAL_PROJECTS", data)
        return resolve(data)
      })
    })
  },
  PUT_ROW({commit}, curr_data){
    return new Promise (resolve => {
      this.$axios.put(`/public_account/row/${curr_data.id}/`, curr_data)
        .then(({data})=>{
          //commit("SET_FINAL_PROJECTS", data)
          return resolve(data)
        })
    })
  },
  PUT_PA({commit}, [pa_id, curr_data]){
    return new Promise (resolve => {
      this.$axios.put(`/public_account/${pa_id}/`, curr_data)
        .then(({data})=>{
          commit("UPDATE_PA", [curr_data.status, pa_id])
          return resolve(data)
        })
    })
  },
  PUT_IMAGE({commit}, [img_id, pp_id,curr_data]){
    return new Promise (resolve => {
      this.$axios.put(`/public_account/image/${img_id}/`, curr_data)
        .then(({data})=>{
          //commit("UPDATE_IMAGE", [data, pp_id])
          return resolve(data)
        })
    })
  },
  FETCH_PUBLIC_ACCOUNTS({commit}, params){
    return new Promise (resolve => {
      this.$axios.get(`/public_account/${params}`).then(({data})=>{
        if (!params)
          commit("SET_PUBLIC_ACCOUNTS", data)
        return resolve(data)
      })
    })
  },
  GET_PUBLIC_ACCOUNT({commit, state}, pa_idx){
    let pa_id = state.public_accounts[pa_idx].id
    return new Promise (resolve => {
      this.$axios.get(`/public_account/${pa_id}/orphan_rows/`).then(({data})=>{
        commit("SET_PA_IN_REVIEW", data)
        return resolve(data)
      })
    })
  },
  POST_PUBLIC_ACCOUNT({commit, state}, new_data){
    let pa_id = state.pa_in_review.public_account_id
    return new Promise (resolve => {
      this.$axios.post(`/public_account/${pa_id}/orphan_rows/`, new_data).then(({data})=>{
        commit("SET_NEXT_PA_IDX", state.curr_pa_idx)
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