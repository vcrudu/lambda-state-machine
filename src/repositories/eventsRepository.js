/**
 * Created by Victor on 26/06/2015.
 */

import loggerProvider from '../logging';
import EventDbMapper from './eventDbMapper';
import _ from 'underscore';
const TABLE_NAME = 'Event';
import util from 'util';

    class EventsRepository {
        constructor(dynamoDb) {
            this._dynamoDb = dynamoDb;
        }

        createTable(callback) {

            var params = {

                TableName: TABLE_NAME,

                KeySchema: [
                    {AttributeName: "userId", KeyType: "HASH"},
                    {AttributeName: "measurementDateTime", KeyType: "RANGE"}
                ],

                AttributeDefinitions: [
                    {AttributeName: "userId", AttributeType: "S"},
                    {AttributeName: "measurementDateTime", AttributeType: "N"}
                ],

                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            };

            this._dynamoDb.createTable(params, function (err, data) {

                if (err) {
                    callback(err, null);
                }

                if (data) {
                    callback(null, data);
                }
            });
        }

        deleteTable (callback) {

            var params = {
                TableName: TABLE_NAME
            };

            this._dynamoDb.deleteTable(params, function (err) {

                if (err) {
                    callback(err, false);
                } else {
                    callback(null, true)
                }
            });
        }

        getLastOne(userId, measurementType, callback) {
            var now = new Date();

            var filterExpression = 'measurementType=:measurementType';

            var params = {
                KeyConditionExpression: 'userId=:userId AND ' +
                'measurementDateTime<=:startTime',

                ExpressionAttributeValues: {
                    ":userId": {"S": userId},
                    ":measurementType": {"S": measurementType},
                    ":startTime": {"N": now.getTime().toString()}
                },

                FilterExpression: filterExpression,
                TableName: TABLE_NAME,
                ScanIndexForward: false,
                Limit: 30
            };

            this._dynamoDb.query(params, function (err, data) {
                if (err) {
                    loggerProvider.getLogger().error(err);
                    callback(err, null);
                    return;
                }
                loggerProvider.getLogger().debug("The notifications has been retrieved successfully.");
                var results = [];
                if (data.Items && data.Items.length > 0) {
                    let eventDbMapper = new EventDbMapper();
                    let event = eventDbMapper.mapEventFromDbEntity(data.Items[0]);
                    callback(null, event);
                } else {
                    callback(null, null);
                }
            });
        }

        save(event, callback) {
            let eventDbMapper = new EventDbMapper();
            let params = {
                Item: eventDbMapper.mapEventToDbEntity(event),
                TableName: TABLE_NAME,
                ReturnConsumedCapacity: 'TOTAL',
                ReturnItemCollectionMetrics: 'SIZE',
                ReturnValues: 'ALL_OLD'
            };

            this._dynamoDb.putItem(params, (err, data) => {
                if (err) {
                    loggerProvider.getLogger().error(err);
                    callback(err, null);
                    return;
                }

                loggerProvider.getLogger().debug("The event has been inserted successfully.");
                callback(null, data);
            });
        }
    }

export default EventsRepository;