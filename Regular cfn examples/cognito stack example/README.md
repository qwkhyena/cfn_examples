# Simple Cognito stack Example

This quick & dirty stack sets up a complete Cognito bundle that includes: UserPool, IdentityPool, both unauthorized and authorized IAM roles, UserPoolClient and IdentityPoolRoleAttachment. We'll also use awscli to create & verify/confirm a test user for testing purposes.


`aws cloudformation package --template-file ./package_cognito.yaml --s3-bucket <some_s3_bucket> --output-template-file deploy_cognito.yaml`

Throws an InsufficientCapabilitiesException error:
`aws cloudformation deploy --template-file ./deploy_cognito.yaml --stack-name cognitoStack1 --parameter-overrides envParameter="dev" --capabilities CAPABILITY_IAM`

Succeeds:
`aws cloudformation deploy --template-file ./deploy_cognito.yaml --stack-name cognitoStack1 --parameter-overrides envParameter="dev" --capabilities CAPABILITY_NAMED_IAM`


### UserPool

This section defines your cognito UserPool. Here's where you can specify your password complexity settings, MFA, user account verifications, analytics and triggers. For this stack, I only had to add `AutoVerifiedAttributes: [ "email" ]`. It defaults to minimum password length of 8, requiring numbers, special characters and both upper & lowercase letters. Also allows folks to sign themselves up.

### UserPoolClient

This section defines the application clients that are allowed to use this user pool. You can specify not to generate a secret key and the refresh token expiration in days or leave them blank to use the defaults which are no secret key and 30 days. You will need to set the UserPoolId however by reference. I'm including the GenerateSecret and RefreshTokenValidity below so you can see them.

```
myApiUserPoolClient:
  Type: "AWS::Cognito::UserPoolClient"
  Properties:
      ClientName: !Sub myApiUserPoolClient${envParameter}
      GenerateSecret: True
      RefreshTokenValidity: 31
      UserPoolId: !Ref myApiUserPool
```

### IdentityPool

This section defines your AWS Cognito Identity Pool where you connect your UserPool (User Pool ID) via your UserPoolClient (App client id) so your AWS services can authenticate against it. There's a very good Identity Pool vs User Pool example [here on serverless-stack.com.](https://serverless-stack.com/chapters/cognito-user-pool-vs-identity-pool.html)


### Unauthorized and Authorized IAM Roles

These are the unauthorized and authorized IAM default roles we'll attach to our IdentityPool. For this example the authorized IAM role allows access to any API GW endpoint if that endpoint is using this IdentityPool (They can definitely be locked down more if you ask me!) 

### IdentityPoolRoleAttachment

I like to think of this as the glue between our IAM Roles we've created and our IdentityPool. You can also specify separate RoleMappings per authentication providers which allows for a much more granular level of permissions.

This is also a good example of a CF 'DependsOn' statement:

```
myApiIdentityPoolRoleAttachment:
  DependsOn: [ myApiIdentityPool, cognitoUnauthRole, cognitoAuthRole ]
  Type: "AWS::Cognito::IdentityPoolRoleAttachment"
  Properties:
    IdentityPoolId: !Ref myApiIdentityPool
    Roles: 
      authenticated: !GetAtt cognitoAuthRole.Arn
      unauthenticated: !GetAtt cognitoUnauthRole.Arn
```


### Creating a test user via awscli cognito-idp:

(client-id is your UserPoolClient's Id aka App Client Id)

`aws cognito-idp sign-up --client-id 2c3oeg83fon4g9q1n2s1jh1r2e --username johndoe@example.com --password P@ssw0rd!`

OR:

`aws cognito-idp sign-up --client-id 70clhgunebf0srlkjqpb3jop2h --username johndoe@example.com --user-attributes Name=email,Value=johndoe@example.com --password P@ssw0rd!`

Returns:

```
{
    "UserConfirmed": false, 
    "UserSub": "78153d33-dcb3-424d-9b43-e77f1435eddf"
}
```

### Confirming/Validating your test user via awscli cognito-idp:

(user-pool-id is your UserPool's Id aka Pool Id)

`aws cognito-idp admin-confirm-sign-up --user-pool-id us-east-1_R61u1Dd5D --username johndoe@example.com`

Returns nothing if successful.


### Additional commands:

`aws cloudformation delete-stack --stack-name cognitoStack1`

`aws cloudformation describe-stacks --stack-name cognitoStack1`

`aws cloudformation list-stack-resources --stack-name cognitoStack1`


### Other commands:

After messing around with cloudformations and cognito related resources, I quickly learned that CFs don't fully implement the aws cognito-idp. Here's some additional commands.

`aws cognito-idp get-ui-customization --user-pool-id us-east-1_ufTRVCUz0 --client-id 2qb2dkc0arpeq2ru5ecp7umeo3` - Before this works, your userPool must have a domain name associated with it. And before you can add a domain, you must have enabled identity providers under App integration->App client settings.

```
aws cognito-idp describe-user-pool-client --user-pool-id us-east-1_ufTRVCUz0 --client-id 2qb2dkc0arpeq2ru5ecp7umeo3                                                                                                                   
{
    "UserPoolClient": {
        "UserPoolId": "us-east-1_ufTRVCUz0", 
        "LastModifiedDate": 1510507330.683, 
        "ClientId": "2qb2dkc0arpeq2ru5ecp7umeo3", 
        "AllowedOAuthFlowsUserPoolClient": false, 
        "SupportedIdentityProviders": [
            "COGNITO"
        ], 
        "RefreshTokenValidity": 30, 
        "CreationDate": 1510506314.081, 
        "ClientName": "myApiUserPoolClientdev"
    }
}

```

Cognito-idp list-user-pool-clients

```
aws cognito-idp list-user-pool-clients --user-pool-id us-east-1_ufTRVCUz0 --max-results 1
{
    "UserPoolClients": [
        {
            "ClientName": "myApiUserPoolClientdev", 
            "UserPoolId": "us-east-1_ufTRVCUz0", 
            "ClientId": "2qb2dkc0arpeq2ru5ecp7umeo3"
        }
    ]
}
```

Cognito-idp describe-user-pool-domain

NOTE: You domain on the App integration page might be fully qualified but here it's just the prefix.

```
aws cognito-idp describe-user-pool-domain --domain 2l3k4j2lkj42l3k4j
{
    "DomainDescription": {
        "Status": "ACTIVE", 
        "Domain": "2l3k4j2lkj42l3k4j", 
        "UserPoolId": "us-east-1_ufTRVCUz0", 
        "CloudFrontDistribution": "d3oia8etllorh5.cloudfront.net", 
        "S3Bucket": "aws-cognito-prod-iad-assets", 
        "Version": "20171112172230", 
        "AWSAccountId": "670155187638"
    }
}
```

### Useful links:

https://serverless-stack.com/chapters/create-a-cognito-test-user.html

https://stackoverflow.com/questions/44503800/how-to-export-cognito-user-pool-settings-to-cloudformation-template

https://serverless-stack.com/chapters/cognito-user-pool-vs-identity-pool.html

https://github.com/emdgroup/cfn-custom-resource



