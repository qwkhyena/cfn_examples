const AWS = require('aws-sdk');
// const dynamodb = new AWS.DynamoDB({region: 'us-east-1', apiVersion: '2012-08-10'});



exports.handler = (event, context, callback) => {
    // TODO implement
    console.log('Received event: ', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'DELETE':
            //TBD
            done(null, 'You just did multiple DELETES!');
            break;
        case 'GET':
            //TBD
            done(null, 'You just did multiple GETs!');
            break;
        case 'POST':
            done(new Error(`Unsupported method POST on plural of Docs: "${event.httpMethod}"`));
            break;
        case 'PUT':
            //TBD
            done(new Error(`Unsupported method PUT on plural of Docs:  "${event.httpMethod}"`));
            break;
        default:
            done(new Error(`Unsupported method default: "${event.httpMethod}"`));
    }
};