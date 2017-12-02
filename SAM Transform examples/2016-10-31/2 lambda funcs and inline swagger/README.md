# Simple 2 lambda funcs and an inline swagger definition

This is a simple CF that deploys 2 lambda functions and an API gateway via an inline swagger definition. Our API gateway will be created with 2 endpoints that are configured as "ANY" method and configured as "Lambda Proxy" integration types (essentially a passthrough to our lambda code.)

We're doing our API Gateway inline for 2 reasons:
- So our method's x-amazon-apigateway-integration uri attribute won't be hardcoded for our AWS::Region.
- Because our lambda function ARN is dynamically defined. If we had tried to use the AWS SAM example api_swagger_cors we would have encountered issues with setting the lamdba function to a staging variable. The lambda function when done via a staging variable never has the right invocation policy permissions for our API Gateway. A number of folks have commented about this online and the work around is doing swagger inline.

#### Steps:

1. Create deploy.yaml file based off our package.yaml file. This will also copy our two index.js files up to S3 for deployment. I tried putting both lambda functions in the same folder but using different file names. This caused lambda to alway complain about 'other files' in the lambda function container that weren't being used when I looked at the AWS Lambda console in a browser.
 
    Type the following:

    `aws cloudformation package --template-file ./package.yaml --s3-bucket <your_S3_bucket_here> --output-template-file deploy.yaml`

2. Next, we'll deploy the CloudFormation by using our newly created deploy.yaml file. If you look at your package.yaml & deploy.yaml you'll notice that they're very similar. The biggest difference is that the package.yaml was pointing to our directories ./fncDoc and ./fncDocs but now they're pointing to our S3 bucket and the zip file with our index.js code in it.

    Type the following:
    
    `aws cloudformation deploy --template-file ./deploy.yaml --stack-name <some_stack_name> --capabilities CAPABILITY_IAM`
    
    NOTE: Because our example CF here needs to create some IAM roles & policies, we'll need to add `--capabilities CAPABILITY_IAM`. Think of this CLI parameter as an explicit acknowledgement that you're aware your CF is going to create IAM resources. If you're creating IAM resources with custom names, you'd need to specify CAPABILITY_NAMED_IAM instead.
    

#### Additional commands:

CF Delete stack:

`aws cloudformation delete-stack --stack-name <some_stack_name>`

CF List Stack related resources:

`aws cloudformation list-stack-resources --stack-name <some_stack_name>`

CF Fetch the PhysicalResourceId for a LogicalResourceId found in your template file:

`aws cloudformation describe-stack-resource --stack-name <some_stack_name> --logical-resource-id FuncDocs`

CF Describe your stack instance:

`aws cloudformation describe-stacks --stack-name <some_stack_name>`

