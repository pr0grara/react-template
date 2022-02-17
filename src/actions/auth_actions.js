import * as APIUtil from '../util/api/authentication_api_util';

export const LOGIN = "LOGIN";

export const login = () => ({
    type: LOGIN,
    action: true
})

export const setFrontendToken = () => {
    console.log('API call to backend about to be made: setFrontendToken()')
    return APIUtil.setAuthToken()
        .then(res => {
            return res
        })
        .catch(err => {
            console.log(err)
        }) 
}

export const authorizeClient = async secret => dispatch => {
    console.log('API call to backend about to be made: authorizeClient()')
    return APIUtil.authorize(secret)
        .then(res => {
            if (res.data === true) {
                localStorage.setItem('clientsecret', secret);
                dispatch(login())
            }
        })
        .catch(err => {
            console.log(err)
        })
}