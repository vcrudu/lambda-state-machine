/**
 * Created by victorcrudu on 20/05/2016.
 */
import chai from 'chai';
import {main as lambda} from '../src/index';

describe('lambda function',()=> {
    chai.should();
    describe('user has no status and send testMessage to lambda', ()=> {
        it('should invoke without errors and status should become StateUnreadWelcome', (done)=> {
            let event = {
                Records: [{
                    Sns: {
                        MessageId: "testMessageId",
                        Timestamp: new Date().getTime(),
                        TopicArn: "testTopicArn",
                        Message: JSON.stringify({
                            name: "OnOneMinuteRemained",
                            payload: {
                                userId: "vcrudu@hotmail.com"
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