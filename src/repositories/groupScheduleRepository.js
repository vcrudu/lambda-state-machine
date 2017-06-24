/**
 * Created by Victor on 26/06/2015.
 */

import loggerProvider from '../logging';
import GlobalMeasurementScheduleDbMapper from './globalMeasurementScheduleDbMapper';
const TABLE_NAME = 'GroupSchedule';

    class GroupScheduleRepository {
        constructor(dynamoDb) {
            this._dynamoDb = dynamoDb;
        }



        getOne(patientId, scheduleType, callback) {
            let getNameFromType= ( string )=>{
                return string.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^([a-z])/g, function (x) {
                    return x.toUpperCase()
                });
            };

            this.getGroupByPatientId(patientId, (err, groupId) => {

                let params = {
                    Key: {scheduleName: {S: getNameFromType(scheduleType)}},
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
            });
        }


        getGroupByPatientId(patientId, callback) {

            let params = {
                KeyConditionExpression: '#patientId=:patientId AND ' +
                '#groupId>=:groupId',

                ExpressionAttributeNames: {
                    "#patientId": "patientId",
                    "#groupId": "groupId"
                },
                ExpressionAttributeValues: {
                    ":patientId": {"S": patientId},
                    ":groupId": {"S": String.fromCharCode(0)}
                },
                IndexName: 'patientId-groupId-index',
                TableName: 'PatientsGroupMember',
                Limit: 700
            };

              function mapPatientsGroupMemberFromDbEntity(dbEntity) {
                  var patientsGroupMember = {};

                  patientsGroupMember.groupId = dbEntity.groupId.S;
                  patientsGroupMember.patientId = dbEntity.patientId.S;
                  return patientsGroupMember;
              }

            this._dynamoDb.query(params, function (err, data) {
                if (err) {
                    loggerProvider.getLogger().error(err);
                    callback(err, null);
                    return;
                }

                var dbMembers = data.Items;

                var resultMembers = [];

                dbMembers.forEach(dbMembers, function (dbMember) {
                    var member = mapPatientsGroupMemberFromDbEntity(dbMember);
                    resultMembers.push(member);
                });

                callback(null, resultMembers.length > 0 ? resultMembers[0].groupId : null);
            });
        }
    }

export default GroupScheduleRepository;