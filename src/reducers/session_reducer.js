import { LOGIN } from "../actions/auth_actions";

const _nullSession = {
    isAuthenticated: false,
};

const  sessionReducer = (state = _nullSession, action) => {
    switch (action.type) {
        case LOGIN:
            return Object.assign({}, state, {
                isAuthenticated: true
            })
        default:
            return state;
    }
}

export default sessionReducer;
