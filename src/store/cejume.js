import axios from "axios";

export const state = () => ({
  rows: undefined,
})

export const getters = {
}

export const mutations = {
  SET_CEJUME (state, states){
    state.rows = states;
  },
}

export const actions = {
  FETCH_CATALOGS4 ({ commit }) {
    return new Promise (resolve => {
      axios.get('https://v1.nocodeapi.com/rickrebel/google_sheets/szGknBEeYNVhJLjd?tabId=sheet1')
      .then(({data})=>{
        commit("SET_CEJUME", data.data)
        return resolve(data.data)
      })
    })
  },
}