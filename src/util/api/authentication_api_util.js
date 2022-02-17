import { PROXY_URL } from '../../config';
import { axiosInstance } from '../util';

const axiosProxy = axiosInstance();

export const setAuthToken = () => {
    const route = "/api/authorization/new-token";
    console.log("SENDING REQ TO: " + PROXY_URL + route)

    return axiosProxy.post(route)
}

export const authorize = clientsecret => {
    const route = "/api/authorization/authorize-survey-analytics-client";
    console.log("SENDING REQ TO: " + PROXY_URL + route)

    return axiosProxy.post(route, { clientsecret })
}