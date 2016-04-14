# fastly-tools

Command Line Utility for interacting with fastly

## Usage

	fastly [options] [command]
    
      Commands:
    
        deploy [options] [folder]
           Deploys VCL in [folder] to the specified fastly service.  Requires FASTLY_KEY env var
    
        convert [vclFile]
           Converts a list of backends written in vcl to json accepted by the fastly API
    
    
      Options:
    
        -h, --help  output usage information


## Commands

### deploy
Deploys VCL in [folder] to the specified fastly service.  Requires FASTLY_KEY env var

	Usage: deploy [options] [folder]
	
	  Options:
	
		-h, --help               output usage information
		-m, --main <main>        Set the name of the main vcl file (the entry point).  Defaults to "main.vcl"
		-v, --vars <vars>        A way of injecting environment vars into the VCL.  So if you pass --vars AUTH_KEY,FOO the values {$AUTH_KEY} and ${FOO} in the vcl will be replaced with the values of the environmemnt variable.  If you include SERVICEID it will be populated with the current --service option
		-e, --env                Load environment variables from local .env file (use when deploying from a local machine
		-s, --service <service>  REQUIRED.  The ID of the fastly service to deploy to.
		-V --verbose             Verbose log output
		b --backends <backends>  Upload the backends specified in <backends> vis the api
		
### convert
Converts a list of backends written in vcl to json accepted by the fastly API

	  Usage: convert [options] [vclFile]
    
      Options:
    
        -h, --help  output usage information
