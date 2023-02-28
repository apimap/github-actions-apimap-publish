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

const core = require('@actions/core');
const github = require('@actions/github');
const {promises: fs} = require('fs');

const {
    getConfiguration,
    METADATA_INPUT_ARGUMENT_KEY,
    TAXONOMY_INPUT_ARGUMENT_KEY,
    README_INPUT_ARGUMENT_KEY,
    CHANGELOG_INPUT_ARGUMENT_KEY,
    getFilepath,
    getApiConfiguration
} = require("./configuration");

const {
    createOrUpdateResource,
    getOrCreateResource
} = require("./rest");

const {
    JSON_CONTENT_TYPE,
    MARKDOWN_CONTENT_TYPE
} = require("./client")

const {getApimapToken} = require("./auth")

/**
 * Get or create the API resouce
 * @param {string} apiName - Name of the API
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<*>|void>}
 */
async function getOrCreateApi(apiName, bearerToken, apiEndpoint) {
    const api = {
        "data": {
            "attributes": {
                "name": apiName,
                "codeRepository": github.context.payload.repository.url
            }
        }
    }

    core.debug(`Preparing api: ${JSON.stringify(api)}`)
    return getOrCreateResource(api, JSON_CONTENT_TYPE, apiName, undefined, bearerToken, apiEndpoint)
}

/**
 * Get or create a version of an API
 * @param {string} apiName - Name of the API
 * @param {string} apiVersion - Version of the API
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<*>|void>}
 */
async function getOrCreateApiVersion(apiName, apiVersion, apiToken, bearerToken, apiEndpoint) {
    const version = {
        "data": {
            "attributes": {
                "version": apiVersion
            }
        }
    }

    core.debug(`Preparing api version: ${JSON.stringify(version)}`)
    return getOrCreateResource(version, JSON_CONTENT_TYPE, apiVersion, apiToken, bearerToken, apiEndpoint)
}

/**
 * Create or update the changelog of an API version
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<*>>}
 */
async function createOrUpdateChangelog(apiToken, bearerToken, apiEndpoint) {
    const filePath = getFilepath(CHANGELOG_INPUT_ARGUMENT_KEY)
    const fileContent = await fs.readFile(filePath, 'utf8')

    core.debug(`Preparing changelog: ${fileContent}`)
    return createOrUpdateResource(fileContent, MARKDOWN_CONTENT_TYPE, "changelog", apiToken, bearerToken, apiEndpoint)
}

/**
 * Create or update the readme of an API version
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<*>>}
 */
async function createOrUpdateReadme(apiToken, bearerToken, apiEndpoint) {
    const filePath = getFilepath(README_INPUT_ARGUMENT_KEY)
    const fileContent = await fs.readFile(filePath, 'utf8')

    core.debug(`Preparing readme: ${fileContent}`)
    return createOrUpdateResource(fileContent, MARKDOWN_CONTENT_TYPE, "readme", apiToken, bearerToken, apiEndpoint)
}

/**
 * Create or update the classifications of an API version
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<*>>}
 */
async function createOrUpdateClassifications(apiToken, bearerToken, apiEndpoint) {
    const filePath = getFilepath(TAXONOMY_INPUT_ARGUMENT_KEY)
    const file = await fs.readFile(filePath, 'utf8')
    const fileContent = JSON.parse(file)

    const classifications = {
        "data": fileContent.data.classifications.map(urn => {
            return {attributes: {urn: urn, taxonomyVersion: "1"}}
        })
    }

    core.debug(`Preparing classifications: ${JSON.stringify(classifications)}`)
    return createOrUpdateResource(classifications, JSON_CONTENT_TYPE, "classification", apiToken, bearerToken, apiEndpoint)
}

/**
 * Create or update the metadata of an API version
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<axios.AxiosResponse<*>>}
 */
async function createOrUpdateMetadata(apiToken, bearerToken, apiEndpoint) {
    const filePath = getFilepath(METADATA_INPUT_ARGUMENT_KEY)
    const file = await fs.readFile(filePath, 'utf8')
    const fileContent = JSON.parse(file)

    const metadata = {
        "data": {
            "attributes": {
                "name": fileContent['data']['name'],
                "description": fileContent['data']['description'],
                "visibility": fileContent['data']['visibility'],
                "api version": fileContent['data']['api version'],
                "release status": fileContent['data']['release status'],
                "interface specification": fileContent['data']['interface specification'],
                "interface description language": fileContent['data']['interface description language'],
                "architecture layer": fileContent['data']['architecture layer'],
                "business unit": fileContent['data']['business unit'],
                "system identifier": fileContent['data']['system identifier'],
                "documentation": fileContent['data']['documentation']
            }
        }
    }

    core.debug(`Preparing metadata: ${JSON.stringify(metadata)}`)
    return createOrUpdateResource(metadata, JSON_CONTENT_TYPE, "metadata", apiToken, bearerToken, apiEndpoint )
}

/**
 *
 * @param {string} apiToken - Unique token for each api added to the catalog. Only returned upon first POST
 * @param {string} bearerToken - Apimap bearer token
 * @param {string} apiEndpoint - Apimap API endpoint
 * @returns {Promise<void>}
 */
async function uploadContent(apiToken, bearerToken, apiEndpoint) {
    const {apiName, apiVersion} = await getApiConfiguration()
    core.debug(`Preparing content upload to ${apiName} using version ${apiVersion}`)

    const api = await getOrCreateApi(apiName, bearerToken, apiEndpoint + "api")
    apiToken = isTokenReceived(api) || apiToken
    core.debug(`Continuing with api token: ${apiToken}`)

    if(isTokenReceived(api)) {
        core.warning(`Please use the following token upon any future runs of this action: ${api['data'].data.meta.token}`)
    }

    await getOrCreateApiVersion(apiName, apiVersion, apiToken, bearerToken, apiEndpoint + "api/" + apiName + "/version")

    await createOrUpdateMetadata(apiToken, bearerToken, apiEndpoint + "api/" + apiName + "/version/" + apiVersion )
    await createOrUpdateClassifications(apiToken, bearerToken, apiEndpoint + "api/" + apiName + "/version/" + apiVersion )
    await createOrUpdateReadme(apiToken, bearerToken, apiEndpoint + "api/" + apiName + "/version/" + apiVersion)
    await createOrUpdateChangelog(apiToken, bearerToken, apiEndpoint + "api/" + apiName + "/version/" + apiVersion)
}

/**
 * Check if a token record has been received in the api response object
 * @param {object} api
 * @returns {true|false}
 */
function isTokenReceived(api){
    return (api
        && api['data']
        && api['data'].data
        && api['data'].data.meta
        && api['data'].data.meta.token)
}

/**
 * Main GitHub action method
 * @returns {Promise<void>}
 */
async function run() {
    try {
        const {audience, orchestra, api, apiToken} = getConfiguration()

        const idToken = await core.getIDToken(audience)
        const bearerToken = await getApimapToken(idToken, orchestra)

        await uploadContent(apiToken, bearerToken, api)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()