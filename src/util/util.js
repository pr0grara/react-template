import axios from "axios";
import { PROXY_URL } from "../config";

export const GenerateToken = () => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"
    let length = chars.length;
    let token = "";
    while (token.length < 15) {
        let char = chars[(Math.floor(Math.random() * length))];
        token = token + char;
    }
    return token;
};

export const axiosInstance = () => {
    return axios.create({ 
        baseURL: PROXY_URL,
    });
}

export const SetProxy = devBoolean => {
    return {
        "proxy": {
            "host": devBoolean ? "http://localhost" : "http://api-dev.eba-cv5q6dar.us-west-1.elasticbeanstalk.com",
            "port": devBoolean ? 5000 : 8080
        }
    }
};