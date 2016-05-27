/**
 * Created by victorcrudu on 20/05/2016.
 */
import loggerProvider from '../logging'
const TABLE_NAME = 'SnsEndpoint';
import _ from 'underscore';

class SnsEndpointsRepository {
    constructor(dynamoDb) {
        this._dynamoDb = dynamoDb;
    }

    getList(userId, callback) {

        var params = {
            KeyConditionExpression: 'userId=:userId AND ' +
            '#token>=:token',

            ExpressionAttributeNames: {
                "#token": "token"
            },
            ExpressionAttributeValues: {
                ":userId": {"S": userId},
                ":token": {"S": " "}
            },
            IndexName: "userId-token-index",
            TableName: TABLE_NAME,
            Limit: 30
        };

        this._dynamoDb.query(params, function (err, data) {
            if (err) {
                loggerProvider.getLogger().error(err);
                callback(err, null);
                return;
            }
            var results = [];
            if (data.Items) {
                _.forEach(data.Items, function (item) {

                    let snsEndpoint = {
                        token: item.token.S,
                        endpointArn: item.endpointArn.S
                    };

                    results.push(snsEndpoint);
                });
                callback(null, results);
            } else {
                callback(null, null);
            }
        });
    }
}

export default SnsEndpointsRepository;