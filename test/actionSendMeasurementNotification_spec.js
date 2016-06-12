/**
 * Created by victorcrudu on 26/05/2016.
 */

import ActionSendMeasurementNotification from '../src/actions/actionSendMeasurementNotification';
import chai from 'chai';
import moment from 'moment';
import awsFactory from '../src/awsFactory';

describe('ActionSendMeasurementNotification',()=> {
    let expect = chai.expect;
    it('should send patient alarm', (done)=> {
        let actionSendMeasurementNotification = new ActionSendMeasurementNotification(awsFactory.getSnsClient());
        let userId = 'vcrudu@hotmail.com';
        var event = {
            name: "Any",
            payload: {
                userId: userId,
                measurementDetails: {
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

        actionSendMeasurementNotification.do(event, (err)=> {
            expect(err).to.be.null;
            done();
        });
    });
});