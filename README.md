# fastly-tools

Command Line Utility for interacting with fastly

## Installation

```
npm install --save-dev @financial-times/fastly-tools
```

## Usage

	fastly [options] [command]
    
      Commands:
    
        deploy [options] [folder]
           Deploys VCL in [folder] to the specified fastly service.  Requires FASTLY_APIKEY env var

      Options:
    
        -h, --help  output usage information


## Commands

### deploy
Deploys VCL in [folder] to the specified fastly service.  Requires FASTLY_APIKEY env var

	Usage: deploy [options] [folder]
	
	  Options:
	
		-h, --help               output usage information
		-m, --main <main>        Set the name of the main vcl file (the entry point).  Defaults to "main.vcl"
		-v, --vars <vars>        A way of injecting environment vars into the VCL.  So if you pass --vars AUTH_KEY,FOO the values {$AUTH_KEY} and ${FOO} in the vcl will be replaced with the values of the environmemnt variable.  If you include SERVICEID it will be populated with the current --service option
		-e, --env                Load environment variables from local .env file (use when deploying from a local machine
		-s, --service <service>  REQUIRED.  The ID of the fastly service to deploy to.
		-V --verbose             Verbose log output
		-b --backends <backends>  Upload the backends specified in <backends> via the api
		--no-vcl                  Just upload backends as specified, no .vcl files
