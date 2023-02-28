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
const {promises: fs} = require('fs');

export const METADATA_INPUT_ARGUMENT_KEY = 'metadata'
export const README_INPUT_ARGUMENT_KEY = 'readme'
export const API_INPUT_ARGUMENT_KEY = 'api'
export const ORCHESTRA_INPUT_ARGUMENT_KEY = 'orchestra'
export const AUDIENCE_INPUT_ARGUMENT_KEY = 'audience'
export const TAXONOMY_INPUT_ARGUMENT_KEY = 'taxonomy'
export const CHANGELOG_INPUT_ARGUMENT_KEY = 'changelog'
export const TOKEN_INPUT_ARGUMENT_KEY = 'token'

/**
 * Return filepath input argument value
 * @param {string} key
 * @returns {string}
 */
export function getFilepath(key) {
    core.debug(`Read filepath from key ${key}`)
    return core.getInput(key, {required: true, trimWhitespace: true})
}

/**
 * Return required input argument value
 * @param {string} key
 * @returns {string}
 */
function getRequiredArgument(key) {
    core.debug(`Read required argument from key ${key}`)
    return core.getInput(key, {required: true, trimWhitespace: false})
}

/**
 * Return optional input argument value
 * @param {string} key
 * @returns {string}
 */
export function getOptionalArgument(key) {
    core.debug(`Read optional argument from key ${key}`)
    return core.getInput(key, {required: false, trimWhitespace: false})
}

/**
 * Get base configuration
 * @returns {{audience: string, orchestra: string, api: string}}
 */
export function getConfiguration() {
    const audience = getRequiredArgument(AUDIENCE_INPUT_ARGUMENT_KEY)
    const orchestra = getRequiredArgument(ORCHESTRA_INPUT_ARGUMENT_KEY)
    const api = getRequiredArgument(API_INPUT_ARGUMENT_KEY)
    const apiToken = getOptionalArgument(TOKEN_INPUT_ARGUMENT_KEY)

    if (apiToken) {
        core.setSecret(apiToken)
    }

    core.debug(`Reading configuration [audience: ${audience}, orchestra: ${orchestra}, api: ${api}, apiToken: ${apiToken}]`)
    return {audience, orchestra, api, apiToken}
}

/**
 * Return API Configuration
 * @returns {{apiName: string, apiVersion: string}}
 */
export async function getApiConfiguration() {
    const filePath = getFilepath(METADATA_INPUT_ARGUMENT_KEY)
    const file = await fs.readFile(filePath, 'utf8')
    const fileContent = JSON.parse(file)

    const apiName = fileContent.data['name']
    const apiVersion = fileContent.data['api version']

    core.debug(`Reading configuration [apiName: ${apiName}, apiVersion: ${apiVersion}]`)
    return {apiName, apiVersion};
}