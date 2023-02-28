/*
Copyright 2021-2023 TELENOR NORGE AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

const core = require("@actions/core");
const axios = require("axios");

export const JSON_CONTENT_TYPE = "application/json"
export const MARKDOWN_CONTENT_TYPE = "text/markdown"

/**
 * Create default REST axios client
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {AxiosInstance}
 */
export function getClient(bearerToken, apiEndpoint) {
    core.debug("Create HTTP client")

    const client = axios
        .create({
            validateStatus: function (status) {
                return (status >= 200 && status < 300) || status == 404
            },
            baseURL: apiEndpoint,
            headers: {
                "Accept": JSON_CONTENT_TYPE,
            }
        });

    client.interceptors.request.use(function (config) {
        if(bearerToken){
            config.headers.Authorization = "Bearer " + bearerToken;
        }

        return config;
    });

    return client;
}
