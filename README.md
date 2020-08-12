# fastly-tools [![CircleCI](https://circleci.com/gh/Financial-Times/fastly-tools.svg?style=svg&circle-token=33bcf2eb98fe2e875cc66de93d7e4a50369c952d)](https://circleci.com/gh/Financial-Times/fastly-tools)

This library is a command line tool for interacting with the FT.com CDN, [Fastly](https://www.fastly.com/).


## Requirements

* Node 5.x


## Installation

```sh
git clone git@github.com:Financial-Times/fastly-tools.git
cd fastly-tools
make install
```


## Development

### Testing

In order to run the tests locally you'll need to run:

```sh
make test
```

### Install from NPM

```sh
npm install --save-dev @financial-times/fastly-tools
```

### Usage

```sh
Usage: fastly [options] [command]

Options:
  -h, --help                      output usage information

Commands:
  deploy [options] [folder]       Deploys VCL in [folder] to the specified fastly service. Requires FASTLY_APIKEY env var which can be found in the repo's corresponding Vault directory.
```

### Deploy

```sh
Usage: deploy [options] [folder]

Deploys VCL in [folder] to the specified fastly service. Requires FASTLY_APIKEY env var which can be found in the repo's corresponding Vault directory. 

Options:
  -m, --main <main>               Set the name of the main vcl file (the entry point).  Defaults to "main.vcl"
  -v, --vars <vars>               A way of injecting environment vars into the VCL.  So if you pass --vars AUTH_KEY,FOO the values {$AUTH_KEY} and ${FOO} in the vcl will be replaced with the values of the environment variable.  If you include SERVICEID it will be populated with the current --service option
  -e, --env                       Load environment variables from local .env file (use when deploying from a local machine
  -s, --service <service>         REQUIRED.  The ID of the fastly service to deploy to.
  -V --verbose                    Verbose log output
  -b --backends <backends>        Upload the backends specified in <backends> via the api
  -k --api-keys <keys>            list of alternate api keys to try should the key stored in process.env.FASTLY_API_KEY hit its rate limit
  --skip-conditions <conditions>  list of conditions to skip deleting
  -h, --help                      output usage information
```

### Example

For example to deploy to a given environment, you would use the following command:

```sh
	fastly-tools deploy -V --vars SERVICEID --main main.vcl --service ${FASTLY_STAGING_SERVICE_ID} --api-keys ${FASTLY_STAGING_APIKEY} --backends backends.js ./vcl/
```
