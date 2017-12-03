# cfn_examples

I've tried documenting a couple of different CFN examples I thought were helpful in understanding CloudFormation stacks.

# Sections

I've broken my cfns into 2 different subtypes:
- [Regular Cloudformation examples](./Regular cfn examples)
- [SAM Transform examples](./SAM Transform examples)


## Observed gotchas so far:
- If you're adding a Domain to your Cognito App Client to authenticate your users, you'll be doing this by hand unless you use a Custom resource type.
- If you add a Domain to the Cognito App Client, you won't be able to delete that Stack until you've deleted the Domain attached to it first.
- If you update CFN to change a Cognito UserPool, it deletes the old one and creates a new one. It also deletes your UserPoolClient attached to it and creates a new one.
- If you're trying to delete an S3 bucket that was created via a CFN stack, make sure it's empty first or the CFN won't delete.
- 