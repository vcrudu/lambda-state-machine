/**
 * Created by victorcrudu on 26/05/2016.
 */

import ActionSendPatientAlarmNotification from '../src/actions/actionSendPatientAlarmNotification';
import chai from 'chai';
import moment from 'moment';
import awsFactory from '../src/awsFactory';

describe('ActionSendPatientAlarmNotification',()=> {
    let expect = chai.expect;
    it('should send patient alarm', (done)=> {
        let actionSendPatientAlarmNotification = new ActionSendPatientAlarmNotification(awsFactory.getSnsClient());
        let userId = 'vcrudu@hotmail.com';
        var event = {
            name: "Any",
            payload: {
                userId: userId,
                alarmMeasurement: {
                    measurementType: 'bloodPressure',
                    value: {
                        systolic: 120,
                        diastolic: 80
                    },
                    utcDateTime: moment().valueOf()
                },
                alarmDetails: {
                    alarmName: 'hypertension',
                    alarmDescription: 'alarmDescription'
                }
            }
        };

        actionSendPatientAlarmNotification.do(event, (err)=> {
            expect(err).to.be.null;
            done();
        });
    });
});