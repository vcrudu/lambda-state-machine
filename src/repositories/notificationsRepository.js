/**
 * Created by Victor on 26/06/2015.
 */

import loggerProvider from '../logging';
import NotificationDbMapper from './notificationDbMapper';
import _ from 'underscore';
const TABLE_NAME = 'Notification';

    class NotificationsRepository {
        constructor(dynamoDb){
            this._dynamoDb= dynamoDb;
        }

        getOne(userId, type, notificationDateTime, callback) {
            var params = {
                Key: {userId: {S: userId}, dateTime: {N: notificationDateTime.getTime().toString()}},
                TableName: TABLE_NAME,
                ReturnConsumedCapacity: 'TOTAL'
            };

            this._dynamoDb.getItem(params, function (err, data) {
                if (err) {
                    loggerProvider.getLogger().error(err);
                    callback(err, null);
                    return;
                }
                loggerProvider.getLogger().debug("The notification has been found successfully.");
                if (data.Item) {
                    let notificationDbMapper = new NotificationDbMapper();
                    var event = notificationDbMapper.mapNotificationFromDbEntity(data.Item);
                    callback(null, event);
                } else {
                    callback(null, null);
                }
            });
        }

        getList(userId, category, startTime, endTime, callback) {

            var filterExpression = '';
            var params;
            if (category != 'All') {
                filterExpression = '#category=:category';

                params = {
                    KeyConditionExpression: 'userId=:userId AND ' +
                    '#dateTime>=:startTime',

                    ExpressionAttributeNames: {
                        "#category": "category",
                        "#dateTime": "dateTime"
                    },

                    ExpressionAttributeValues: {
                        ":userId": {"S": userId},
                        ":category": {"S": category},
                        ":startTime": {"N": startTime.getTime().toString()}
                    },

                    FilterExpression: filterExpression,
                    TableName: TABLE_NAME,
                    Limit: 30
                };
            } else {
                params = {
                    KeyConditionExpression: 'userId=:userId AND ' +
                    '#dateTime>=:startTime',

                    ExpressionAttributeNames: {
                        "#dateTime": "dateTime"
                    },
                    ExpressionAttributeValues: {
                        ":userId": {"S": userId},
                        ":startTime": {"N": startTime.getTime().toString()}
                    },
                    TableName: TABLE_NAME,
                    Limit: 30
                };
            }

            this._dynamoDb.query(params, function (err, data) {
                if (err) {
                    loggerProvider.getLogger().error(err);
                    callback(err, null);
                    return;
                }
                loggerProvider.getLogger().debug("The notifications has been retrieved successfully.");
                var results = [];
                if (data.Items) {
                    _.forEach(data.Items, function (item) {
                        let notificationDbMapper = new NotificationDbMapper();
                        var notification = notificationDbMapper.mapNotificationFromDbEntity(item);
                        results.push(notification);
                    });
                    callback(null, results);
                } else {
                    callback(null, null);
                }
            });
        }

        save(notification, callback) {

            let notificationDbMapper = new NotificationDbMapper();
            var params = {
                Item: notificationDbMapper.mapNotificationToDbEntity(notification),
                TableName: TABLE_NAME,
                ReturnConsumedCapacity: 'TOTAL',
                ReturnItemCollectionMetrics: 'SIZE',
                ReturnValues: 'ALL_OLD'
            };

            this._dynamoDb.putItem(params, function (err, data) {
                if (err) {
                    loggerProvider.getLogger().error(err);
                    callback(err, null);
                    return;
                }

                loggerProvider.getLogger().debug("The notification has been inserted successfully.");
                callback(null, data);
            });
        }
    }

export default NotificationsRepository;