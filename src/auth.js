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
const {getClient} = require("./client")

const GITHUB_OAUTH_APIMAP_ENDPOINT = "oauth2/https%3A%2F%2Ftoken.actions.githubusercontent.com/token"

/**
 * Convert a GitHub ID token into an Apimap disposable bearer token
 * @param {string} idToken - GitHub ID Token
 * @param {string} orchestraEndpoint- Apimap Orchestra API endpoint
 * @returns {Promise<axios.AxiosResponse<string> | void>}
 */
export function getApimapToken(idToken, orchestraEndpoint) {
    core.debug("Send token request to Apimap instance")

    return getClient(idToken, orchestraEndpoint)
        .get(GITHUB_OAUTH_APIMAP_ENDPOINT)
        .then(response => response.data['access_token'])
        .catch(error => core.warning(error))
}