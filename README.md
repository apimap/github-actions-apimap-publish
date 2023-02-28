Apimap.io GitHub Action
===

🎉 **Welcome** 🎉

This is the home of the Apimap.io project, a freestanding solution to keep track of all functionality a company
provides through an API. It is a push based system, connected with your build pipeline or manually updated using our CLI.

This is the GitHub Action that enables easy publishing to your organizations apimap installation (cloud or on-prem).

> **Application programming interface (API)**: Point of functional integration between two or more systems connected
> through commonly known standards

**Why is this project useful?** Lost track of all the API functionality provided inside your organization? Don't want
to be tied to an API proxy or management solution? The Apimap.io project uploads, indexes and enables discoverability of all
your organizations APIs. We care about the source code, removing the limitation of where the API is hosted and how your
network is constructed.

## Table of Contents

* [Project Components](#project-components)
* [Run](#run)
* [Contributing](#contributing)

## Project Components
___
This is a complete software solution consisting of a collection of freestanding components. Use only the components you
find useful, create the rest to custom fit your organization.

- A **Developer Portal** with wizards and implementation information
- A **Discovery Portal** to display APIs and filter search results
- An **API** to accommodate all the information
- An **Orchestra API** to manage access rights and SSO integration
- A **Jenkins plugin** to automate information parsing and upload
- A **GitHub Action** to automate information parsing and upload 
- A **CLI** to enable manual information uploads

## Run
___

This GitHub action should be run using the following step:

```yaml
      - name: Apimap Publish
        id: apimap
        uses: apimap/publish@v1
        with:
          api: <address to the api instance>
          orchestra: <address to the orchestra instance>
          audience: <the audience required by the orchestra instance>
          token: <the api token received when the api was created>
          metadata: <path to the metadata file, default value apimap/metadata.apimap>
          taxonomy: <path to the taxonomy file, default value apimap/taxonomy.apimap>
          readme: <path to the readme file, default value README.md>
          changelog: <path to the changelog file, default value CHANGELOG.md>
```

> IMPORTANT: The first time you run this action, and it creates a new API a token will be printed. This token is not a secret, but we recommend the use of 'Repository secrets' to store it and it most be used in all following runs

## Required permissions

Since this action uses the GitHub ID Token the following permissions must be given:

```yaml
permissions:
  contents: read
  id-token: write
```

## Branch

It is recommended to only use this action on the main branch

## Input options

| Argument  | Description                                     | Default                |
|-----------|-------------------------------------------------|------------------------|
| api       | Address to the api instance                     | undefined              |
| orchestra | Address to the orchestra instance               | undefined              |
| audience  | The audience required by the orchestra instance | undefined              |
| token     | The api token received when the api was created | undefined              |
| metadata  | Path to the metadata file                       | apimap/metadata.apimap |
| taxonomy  | Path to the taxonomy file                       | apimap/taxonomy.apimap |
| readme    | Path to the readme file                         | README.md              |
| changelog | Path to the changelog file                      | CHANGELOG.md           |
| --------- | ------------------------------------------------| ----------------------–|

## Contributing
___

Read [howto contribute](CONTRIBUTING.md) to this project.