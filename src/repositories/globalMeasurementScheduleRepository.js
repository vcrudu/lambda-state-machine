/**
 * Created by Victor on 26/06/2015.
 */

import loggerProvider from '../logging';
import GlobalMeasurementScheduleDbMapper from './globalMeasurementScheduleDbMapper';
const TABLE_NAME = 'GlobalMeasurementSchedule';

    class GlobalMeasurementScheduleRepository {
        constructor(dynamoDb) {
            this._dynamoDb = dynamoDb;
        }

        createTable(callback) {

            var params = {

                TableName: TABLE_NAME,

                KeySchema: [
                    {AttributeName: "scheduleType", KeyType: "HASH"}
                ],

                AttributeDefinitions: [
                    {AttributeName: "scheduleType", AttributeType: "S"}
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

        deleteTable(callback) {

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

        getOne(scheduleType, callback) {
            var params = {
                Key: {scheduleType: {S: scheduleType}},
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
                    let globalMeasurementScheduleDbMapper = new GlobalMeasurementScheduleDbMapper();
                    var globalMeasurementSchedule = globalMeasurementScheduleDbMapper.mapFromDbEntity(data.Item);
                    callback(null, globalMeasurementSchedule);
                } else {
                    callback(null, null);
                }
            });
        }

        save(globalMeasurementSchedule, callback) {
            let globalMeasurementScheduleDbMapper = new GlobalMeasurementScheduleDbMapper();
            let params = {
                Item: globalMeasurementScheduleDbMapper.mapToDbEntity(globalMeasurementSchedule),
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

export default GlobalMeasurementScheduleRepository;