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
const {getClient} = require("./client")

/**
 * Get or Create a REST resource
 * @param {string} content - Resource content
 * @param {string} contentType - Define content type
 * @param {string} resourceIdentifier - URL identifier of the resource
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<any> | void>}
 */
export async function getOrCreateResource(content, contentType, resourceIdentifier, apiToken, bearerToken, apiEndpoint) {
    const requestConfig = {
        headers: {
            "Apimap-Api-Token": apiToken,
            "Content-Type": contentType
        }
    }

    /**
     *
     * @returns {Promise<any>}
     */
    var postResource = function () {
        core.debug(`Creating resource at endpoint: ${apiEndpoint}`)

        return getClient(bearerToken, apiEndpoint)
            .post("", content, requestConfig)
            .then(response => {
                core.debug(`Received http status: ${response.status}`)
                return response
            })
            .catch(error => core.error(`Unable to create ${apiEndpoint}/${resourceIdentifier}, with error: ${error}`))
    }

    core.debug(`Requesting resource at endpoint: ${apiEndpoint}/${resourceIdentifier}`)
    return getClient(bearerToken, apiEndpoint)
        .get("/" + resourceIdentifier, {
            headers: {
                Accept: contentType
            }
        })
        .then(response => {
            core.debug(`Received http status: ${response.status}`)
            if (response.status === 404) {
                return postResource()
            }
            return response
        })
        .catch(error => core.error(`Unable to get ${apiEndpoint}, with error: ${error}`))
}

/**
 * Create or update a REST resource
 * @param {string} content - Resource content
 * @param {string} contentType - Define content type
 * @param {string} resourceIdentifier - URL identifier of the resource
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export async function createOrUpdateResource(content, contentType, resourceIdentifier, apiToken, bearerToken, apiEndpoint) {
    const requestConfig = {
        headers: {
            "Apimap-Api-Token": apiToken,
            "Content-Type": contentType
        }
    }

    /**
     *
     * @returns {Promise<any>}
     */
    var postResource = function () {
        core.debug(`Creating resource at endpoint: ${apiEndpoint}/${resourceIdentifier}`)

        return getClient(bearerToken, apiEndpoint)
            .post("/" + resourceIdentifier, content, requestConfig)
            .then(response => {
                core.debug(`Received http status: ${response.status}`)
                return response
            })
            .catch(error => core.error(`Unable to create ${apiEndpoint}/${resourceIdentifier}, with error: ${error}`))
    }

    /**
     *
     * @returns {Promise<any>}
     */
    var putResource = function () {
        core.debug(`Updating resource at endpoint: ${apiEndpoint}/${resourceIdentifier}`)

        return getClient(bearerToken, apiEndpoint)
            .put("/" + resourceIdentifier, content, requestConfig)
            .then(response => {
                core.debug(`Received http status: ${response.status}`)
                return response
            })
            .catch(error => core.error(`Unable to update ${apiEndpoint}/${resourceIdentifier}, with error: ${error}`))
    }

    core.debug(`Requesting resource at endpoint: ${apiEndpoint}/${resourceIdentifier}`)
    return getClient(bearerToken, apiEndpoint)
        .get("/" + resourceIdentifier, {
            headers: {
                Accept: contentType
            }
        })
        .then(response => {
            core.debug(`Received http status: ${response.status}`)

            if (response.status === 404) {
                return postResource()
            }
            return putResource()
        })
}
