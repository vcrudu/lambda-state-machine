/**
 * Created by victorcrudu on 07/05/2016.
 */

import loggerProvider from '../logging';
const  TABLE_NAME        = 'User';

class UserRepository {

    constructor(dynamoDb) {

        this._dynamoDb = dynamoDb;
    }

    findOneByEmail(email, callback) {

        let params = {
            Key: {email: {S: email}},
            TableName: TABLE_NAME,
            ReturnConsumedCapacity: 'TOTAL'
        };

        let mapUserFromDbEntity = function(dbEntity) {

            return {
                email: dbEntity.email.S,
                name: dbEntity.name.S,
                surname : dbEntity.surname.S,
                userState: dbEntity.userState?dbEntity.userState.S:undefined
            };
        };

        this._dynamoDb.getItem(params, function (err, data) {
            if (err) {
                loggerProvider.getLogger().error(err);
                callback(err, null, state);
                return;
            }
            loggerProvider.getLogger().debug("The user has been found successfully.");
            if (data.Item) {
                var user = mapUserFromDbEntity(data.Item);
                callback(null, user);
            } else {
                callback(null, null);
            }
        });
    }

    updateState(userId, userState, callback) {

        var params = {
            Key: {email: {S: userId}},
            TableName: TABLE_NAME,
            ExpressionAttributeValues: {
                ":userState": {"S": userState},
            },
            ReturnConsumedCapacity: 'TOTAL',
            UpdateExpression: 'SET userState=:userState'
        };

        this._dynamoDb.updateItem(params, function (err, data) {
            if (err) {
                loggerProvider.getLogger().error(err);
                callback(err, null);
                return;
            }
            loggerProvider.getLogger().debug("The status has been updated successfully.");
            callback(null, data);
        });
    }
}

export default UserRepository;