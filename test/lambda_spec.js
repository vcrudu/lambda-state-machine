/**
 * Created by victorcrudu on 20/05/2016.
 */
import chai from 'chai';
import {main as lambda} from '../src/index';
import util from 'util';

describe('lambda function',function(){
    chai.should();
    this.timeout(10000);
    describe('user has no status and send testMessage to lambda', ()=> {
        it('should invoke without errors and status should become StateUnreadWelcome', (done)=> {
            let event = {
                Records: [{
                    Sns: {
                        MessageId: "testMessageId",
                        Timestamp: new Date().getTime(),
                        TopicArn: "testTopicArn",
                        Message: JSON.stringify({
                            "name": "OnAppointmentBooking",
                            "payload": {
                                "userId": "vcrudu1@hotmail.com",
                                "providerId": "who@hotmail.com",
                                "providerTitle": "Dr.",
                                "providerFullName": "Martin Who",
                                "providerType": "Medicine",
                                "appointmentDateTime": 1467207900000
                            }
                        })
                    }
                }]
            };
            lambda(event, null, (err)=> {
                done();
            });
        });
    });
});