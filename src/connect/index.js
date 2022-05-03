import axios from "axios"
import store from "@/store"
import router from "@/router";

const connectServer = axios.create()

// connectServer.defaults.baseURL = "http://127.0.0.1:2333"

connectServer.defaults.timeout = 1000

connectServer.interceptors.request.use(function (config) {
    config.headers.Authorization = 'Bearer ' + store.state.token
    return config
}, function (error) {
    console.log(error)
    return Promise.reject(error);
})

connectServer.interceptors.response.use(function (response) {
    if (response.data.name !== undefined) {
        store.commit("saveName", response.data.name.toUpperCase())
    }
    if (response.data.token !== undefined) {
        store.commit("saveToken", response.data.token)
    }
    return response
}, function (error) {
    if (error.response.status === 401 || error.response.status === 400) {
        router.push('/login')
    }
    return Promise.reject(error);
})

export default connectServer