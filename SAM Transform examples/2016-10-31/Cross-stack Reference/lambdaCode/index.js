const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {

/* 
Directly stolen from here: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property?shortFooter=true 
*/
  var myTableName = process.env.TABLE_NAME;
  
 var params = {
  ExpressionAttributeValues: {
   ":v1": {
     S: "jdoe"
    }
  }, 
  KeyConditionExpression: "userId = :v1",
  TableName: myTableName
 };
 
 dynamodb.query(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else {
       console.log(JSON.stringify(data, null, 2)); // successful response
        callback(null, data);
   }
 });
    
};