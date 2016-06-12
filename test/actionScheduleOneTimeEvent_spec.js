/**
 * Created by victorcrudu on 26/05/2016.
 */

import ActionScheduleOneTimeEvent from '../src/actions/actionScheduleOneTimeEvent';
import chai from 'chai';
import moment from 'moment';

describe('actionScheduleEvent',()=> {
    let expect = chai.expect;
    it('should schedule event', ()=> {
        let actionScheduleEvent = new ActionScheduleOneTimeEvent('testAction');
        let userId = 'vcrudu@hotmail.com';
        let plus60Sec = moment(new Date()).add(60, 's');
        let appointmentDateTime = plus60Sec.valueOf();
        var event = {
            name: "Any",
            payload: {
                userId: userId,
                appointmentDateTime: appointmentDateTime
            }
        };
        actionScheduleEvent.do(event, (err)=> {
            expect(err).to.be.null;
        });
    });
});