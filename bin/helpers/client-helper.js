const _ = require('lodash');
const axios = require("axios");
const config = require('../../config/server')

const proxy = (req) => {
    // console.log('req.headers.referer',req.get('Referrer') )
    let url = req.header('origin');    
    console.log('proxy url', url);
    if (url == 'http://localhost:3000' || url == 'http://58.84.34.65:8088') {
        // url = 'http://kyc-tuidentidad.hubex.tech';
        url = 'http://kyc-cathay.hubex.tech';
    }

    return url;
};

const get = async (_url, method) => {
    let url = `${_url}/${config.configUrls.methods[method]}`;
    console.log('url', url)
    const _config = {
        method: 'get',
        url: url,
    };
    try {
        return await axios(_config);
    } catch (error) {
        return {success: false, error: error}
    }
};
const set = async (_url, method, data) => {
    let url = `${_url}/${config.configUrls.methods[method]}`;
    const _config = {
        method: 'post',
        url: url,
        data: data
    };
    try {
        return await axios(_config);
    } catch (error) {
        return {success: false, error: error}
    }
};

const getCustom = async (customUrl, headers, method) => {
    const _config = {
        method: method,
        url: customUrl,
    };
    try {
        return await axios(_config);
    } catch (error) {
        console.log('clientGetCustom error', error)
        return {success: false, error: error}
    }
};
const otp = function () {
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = {
    get: get,
    set: set,
    getCustom: getCustom,
    proxy: proxy,
    otp: otp
};
