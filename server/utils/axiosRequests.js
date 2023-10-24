const axios = require('axios');
const qs = require('qs');
class AxiosRequest {

    constructor(){}

    execRequest = (endpoint, data, headers, method) => {
        return new Promise((resolve, reject) => {
            
            let _data = qs.stringify(data);
            let config = {
                method: method,
                maxBodyLength: Infinity,
                url: endpoint,
                headers: headers,
                data: _data
            };
            (config);
            axios.request(config).then((response) => {
                resolve(response.data);
            }).catch((error) => {
                resolve(error);
            });
        })
    }
    execRequestJSON = (endpoint, data, headers, method) => {
        return new Promise((resolve, reject) => {
            
           
            let config = {
                method: method,
                maxBodyLength: Infinity,
                url: endpoint,
                headers: headers,
                data: data
            };
            (config);
            axios.request(config).then((response) => {
                resolve(response.data);
            }).catch((error) => {
                resolve(error);
            });
        })
    }
}

let axiosRequest = new AxiosRequest()
module.exports = axiosRequest