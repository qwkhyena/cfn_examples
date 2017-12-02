### Use Amazon QuickSight Federated Single Sign-On with Amazon Cognito User Pools

This example was grabbed from here:

https://aws.amazon.com/blogs/big-data/using-amazon-quicksight-federated-single-sign-on-with-amazon-cognito-user-pools/

https://github.com/awslabs/aws-cognito-quicksight-auth




Interesting to note:
- If you've created an S3 bucket, the CF can't be deleted until all contents of that bucket are gone.
- If you've created a cognito UserPoolClient, it can't be deleted until you've removed the domain associated with it.



#### Commands:

aws cloudformation package --template-file ./quicksight.yaml --output-template-file deploy.yaml --s3-bucket samplebucket4deploys

aws cloudformation deploy --template-file ./deploy.yaml --stack-name CognitoQuickSight --capabilities CAPABILITY_IAM

aws cloudformation describe-stacks --query 'Stacks[0].[Outputs[].[OutputKey,OutputValue]]|[]' --output text --stack-name CognitoQuickSight

aws cognito-idp describe-user-pool-client --user-pool-id us-east-1_aP4uWJY6M --client-id 70clhgunebf0srlkjqpb3jop2h
```
{
    "UserPoolClient": {
        "UserPoolId": "us-east-1_aP4uWJY6M", 
        "LastModifiedDate": 1511984847.402, 
        "ClientId": "70clhgunebf0srlkjqpb3jop2h", 
        "AllowedOAuthFlowsUserPoolClient": false, 
        "WriteAttributes": [
            "email"
        ], 
        "RefreshTokenValidity": 30, 
        "CreationDate": 1511984847.402, 
        "ClientName": "QuickSight"
    }
}
```

Same command but after configuring by hand the UserPoolClient:

```
{
    "UserPoolClient": {
        "CallbackURLs": [
            "https://d1tjbhthskhvqq.cloudfront.net"
        ], 
        "AllowedOAuthScopes": [
            "openid"
        ], 
        "UserPoolId": "us-east-1_aP4uWJY6M", 
        "AllowedOAuthFlowsUserPoolClient": true, 
        "LastModifiedDate": 1511987005.822, 
        "ClientId": "70clhgunebf0srlkjqpb3jop2h", 
        "AllowedOAuthFlows": [
            "implicit"
        ], 
        "LogoutURLs": [
            "https://d1tjbhthskhvqq.cloudfront.net"
        ], 
        "SupportedIdentityProviders": [
            "COGNITO"
        ], 
        "WriteAttributes": [
            "email"
        ], 
        "RefreshTokenValidity": 30, 
        "CreationDate": 1511984847.402, 
        "ClientName": "QuickSight"
    }
}
```
aws cognito-idp describe-user-pool-domain --domain 2l3k4j2lkj42l3k4j

```
{
    "DomainDescription": {
        "Status": "ACTIVE", 
        "Domain": "quicksightusers123987", 
        "UserPoolId": "us-east-1_aP4uWJY6M", 
        "CloudFrontDistribution": "d3oia8etllorh5.cloudfront.net", 
        "S3Bucket": "aws-cognito-prod-iad-assets", 
        "Version": "20171129201346", 
        "AWSAccountId": "670155187638"
    }
}
```


aws s3 sync .  s3://cognitoquicksight-s3website-12p94ytls5f4u --acl public-read 

aws s3 ls s3://cognitoquicksight-s3website-12p94ytls5f4u

