# Simple Cross-Stack Reference Example

This 2 CloudFormation stack example was done so I had a better understanding of using stack Exports and Imports (Cross-Stack Referencing.) One CF will create a DDB table and exports out the DDB table name & DDB ARN for the second CF to import in and use.

I can quickly see where it makes sense to have multiple stacks within your serverless application because:
- Your package files can quickly grow to significantly large files.
- You won't want to redeploy DDB & API GW resources multiple times because you're just tweaking a lambda function.
- You'll probably have multiple folks or teams working on a serverless application and it will make sense to break up your CF resources into multiple stacks.

### Our 2 CF example will create two CF stacks:
1. StackA will be our DDB table which has a primary key (HASH) and sort key (RANGE) defined. We'll also be exporting out 2 variables called StackA-DDBTableARN and StackA-DDBTableName for StackB to use.
2. StackB will have a standalone lambda function that uses the two variables mentioned above but also uses AWS CLI CF parameters to define a mock DDB password (DDBPasswd) and import in our first CF stack named StackA.


### StackA

Like our previous example, we'll use a package file to generate a template file and then deploy StackA which creates our DDB table called 2StacksExampleTable w/ a composite key of userId and objectId. We'll also use an awscli command to upload some sample data to our newly created DDB table so the lambda function has something to pull.

`aws cloudformation package --template-file ./package_db.yaml --s3-bucket <some_s3_bucket> --output-template-file deploy_db.yaml`

NOTE: Even though we're not zipping any code up and uploading it to our S3 bucket, it's still required :(

`aws cloudformation deploy --template-file deploy_db.yaml --stack-name StackA`

Okay, a couple of interesting things here to point out.
- We didn't need to use `--capabilities CAPABILITY_IAM`! Why you ask? Because we didn't create any IAM policies or roles for StackA. This should help reinforce that the `--capabilities` cli parameter is required as an explicit acknowledgement that you're giving your permission for awscli to create IAM policies or roles.
- If you log into your AWS CF mgmt console, you'll now see under 'Exports' two newly created variables called StackA-DDBTableARN and StackA-DDBTableName. If you click these variables, you can see under the 'Export Detail' page that nothing is currently importing these variables. Once we've created StackB, that will change.

Now let's import in some DDB data for our table using awscli:

`aws dynamodb batch-write-item --request-items file://2StacksExampleTable.json`

This will import in 25 rows in our DDB table for StackB to query against. For what it's worth, the batch-write-item command is limited to 25 put requests at a time which is why we're only importing in 25 rows!

### StackB

For our second CF stack, we're deploying a lambda function that uses one of the exported variables from StackA but also creates a custom IAM role for our lambda function with  invoke permissions and 2 IAM inline policies to write to CloudWatch and to do a DynamoDB Query against our DDB Table's ARN by importing in our second StackA variable. The lambda function also 'DependsOn' the IAM role to be created first before it's created. We're doing this explicitly even though AWS CF probably could have figured it out on it's own. We're also requiring a password be passed in via CLI and given to the lambda function as an env variable.

`aws cloudformation package --template-file ./package_lambda.yaml --s3-bucket <some_s3_bucket> --output-template-file deploy_lambda.yaml`

and then...

`aws cloudformation deploy --template-file ./deploy_lambda.yaml --stack-name StackB --parameter-overrides DDBStack="StackA" DDBPasswd="SomeFricknPass2!" --capabilities CAPABILITY_IAM`

NOTE: This isn't a "Security Approved" way of giving your lambda functions sensitive data like passwords! I was simply doing it to show the difference between our 2 parameters we passed in. One parameter is used to import in a value from another stack, StackA. The DDBPasswd parameter shows that we're assigning to the environment variable SOME_PASSWORD the value by reference of DDBPasswd. You should be using KMS for handling sensitive variables to your lambda functions.

### Additional commands:

`aws cloudformation delete-stack --stack-name StackA`

If you try to delete StackA first, you'll quickly notice you can't. StackB depends on StackA and that's an interesting concept. You can make some changes to StackA but you can't change the DDB TableName as StackB is referencing it. You'll need to delete StackB first and then you can delete StackA.

`aws cloudformation describe-stacks --stack-name StackB` - Shows that our DDBPasswd parameter is being '******' out in the cli output. It however isn't masked at the lambda function level.

`aws cloudformation list-stack-resources --stack-name StackB`

`aws cloudformation list-exports` - Shows the entire list of Exports created and their ExportingStackId, Value & Name.

`aws cloudformation list-imports --export-name StackA-DDBTableARN` - Shows all of the stacks that are using this Export.
