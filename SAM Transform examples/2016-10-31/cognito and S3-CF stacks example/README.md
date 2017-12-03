# A slightly more complicated series of CFN stacks that host a simple webpage via S3/CloudFront and demonstrate CognitoIdentity usage.

This series of cloudformations are deployed out to support a simple javascript website that hosts the sample files from:
https://github.com/aws/amazon-cognito-auth-js

Once deployed, you'll need to update the index.html file's section for these values:

```

  // Initialize a cognito auth object.
	function initCognitoSDK() {
		var authData = {
			ClientId : '<TODO: your app client ID here>', // Your client id here
			AppWebDomain : '<TODO: your app web domain here>',
			TokenScopesArray : '<TODO: your scope array here>',
			RedirectUriSignIn : '<TODO: your redirect url when signed in here>',
			RedirectUriSignOut : '<TODO: your redirect url when signed out here>'
		};
		var auth = new AWSCognito.CognitoIdentityServiceProvider.CognitoAuth(authData);
		auth.userhandler = {
			onSuccess: <TODO: your onSuccess callback here>,
			onFailure: <TODO: your onFailure callback here>
			/** E.g.
			onSuccess: function(result) {
				alert("Sign in success");
				showSignedIn(result);
			},
			onFailure: function(err) {
				alert("Error!" + err);
			}*/
		};
```

(HINT: For TokenScopesArray, that needs an array value(s) so something like ['openid'] or ['openid','email'] would work.)


## Commands:

`aws cloudformation package --template-file ./package_cognito_related.yaml --s3-bucket <some_s3_bucket> --output-template-file deploy_cognito_related.yaml`

`aws cloudformation deploy --template-file ./deploy_cognito_related.yaml --stack-name cognitoIdentityStack1 --capabilities CAPABILITY_NAMED_IAM`


`aws cloudformation package --template-file ./package_s3_cloudfront.yaml --s3-bucket <some_s3_bucket> --output-template-file deploy_s3_cloudfront.yaml`

`aws cloudformation deploy --template-file ./deploy_s3_cloudfront.yaml --stack-name s3CognitoStack2`



