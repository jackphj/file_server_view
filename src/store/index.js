import {createStore} from 'vuex'

export default createStore({
    state: {
        token: '' || localStorage.getItem("token"),
        location: [],
        user_name: '' || 'share'
    },
    getters: {
        locationGet: (state) => {
            if (state.location.length === 0) {
                return ['/']
            } else {
                return state.location
            }
        }
    },
    mutations: {
        saveToken(state, payload) {
            localStorage.removeItem("token");
            localStorage.setItem('token', payload);
            state.token = payload;
        },
        saveName(state, payload) {
            if (payload) {
                state.user_name = payload
            }
        },
        locationPush(state, payload) {
            let push = ''
            if (state.location.length === 0) {
                push = '/./' + payload
            } else {
                push = state.location[state.location.length - 1] + '/./' + payload
            }
            state.location.push(push)
        },
        locationPop(state) {
            // if (state.location.length >= 1) {
            //
            // } else {
            //     state.location = []
            // }
            state.location.pop()
        },
        locationJump(state, payload) {
            if (payload === '/') {
                state.location = []
            } else {
                let result = []
                for (let i = 0; i < state.location.length; i++) {
                    if (state.location[i] !== payload) {
                        result[i] = state.location[i]
                    } else if (state.location[i] === payload) {
                        result[i] = state.location[i]
                        break;
                    }
                }
                state.location = result
            }
        }
    },
    actions: {},
    modules: {}
})
