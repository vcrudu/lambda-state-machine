/**
 * Created by victorcrudu on 09/10/2016.
 */

import IsMeasureNotOnTime from '../src/guards/isMeasureNotOnTime';
import chai from 'chai';
import sinon from 'sinon';
import moment from 'moment';
import util from 'util';
import repositoriesFactory from '../src/repositories/repositoriesFactory';


describe('IsMeasureNotOnTime',()=> {
    let eventsRepositoryStub,
        getGlobalMeasurementScheduleRepositoryStub,
        stateEvent,
        measurementSchedule,
        event;

    before(()=> {

        measurementSchedule = {
            "dayTimePoints": [     ///moments of the day
                {
                    "reminders": [        /// offset in minutes to remind the patient the an action will be needed to do.
                        -240,                   ///remind the patient 4 hours before 12:00am .
                        -60                      ///remind the patient 1 hour before 12:00am .
                    ],
                    "time": "12:00"
                },
                {
                    "reminders": [
                        -240,                   ///remind the patient 4 hours before 10:00pm .
                        -60                      ///remind the patient 1 hour before 10:00pm .
                    ],
                    "time": "22:00"
                }
            ],
            "measurementType": "bloodPressure"
        };

        event = {
            bloodPressure: {
                systolic: 120, diastolic: 80
            }
            ,
            userId: 'vcrudu@hotmail.com',
            measurementDateTime: 1475920800000,
            measurementType: 'bloodPressure'
        };

        stateEvent = {
            runAt: 1476082800000,
            payload: {
                userId: "vcrudu@hotmail.com",
                eventName: "StateWaitingMeasurement",
                scheduleType: "bloodPressure"
            }
        };

        eventsRepositoryStub = {
            getLastOne: sinon.stub().callsArgWith(2, null, event)
        };

        getGlobalMeasurementScheduleRepositoryStub = {
            getOne: sinon.stub().callsArgWith(1, null, measurementSchedule)
        };

        sinon.stub(repositoriesFactory,
            "getEventsRepository",
            sinon.stub().returns(eventsRepositoryStub));

        sinon.stub(repositoriesFactory,
            "getGlobalMeasurementScheduleRepository",
            sinon.stub().returns(getGlobalMeasurementScheduleRepositoryStub));

    });

    let expect = chai.expect;
    it('should be false when the event exists', (done)=> {

        let isMeasureNotOnTime = new IsMeasureNotOnTime();

        stateEvent.runAt = moment().hours(9).minutes(0).seconds(0).valueOf();
        event.measurementDateTime = moment().hours(8).minutes(30).seconds(0).valueOf();

        isMeasureNotOnTime.check(stateEvent, (err, result)=> {
            expect(err).to.be.null;
            expect(result).to.be.false;
            done();
        });
    });

    it('should be true when the event is missing', (done)=> {

        stateEvent.runAt = moment().hours(8).minutes(0).seconds(0).valueOf();
        event.measurementDateTime = moment().hours(1).minutes(0).seconds(0).valueOf();

        let isMeasureNotOnTime = new IsMeasureNotOnTime();

        isMeasureNotOnTime.check(stateEvent, (err, result)=> {
            expect(err).to.be.null;
            expect(result).to.be.true;
            done();
        });
    });

    it('should be false when the event is between 18:00 - 22:00', (done)=> {

        stateEvent.runAt = moment().hours(20).minutes(0).seconds(0).valueOf();
        event.measurementDateTime = moment().hours(19).minutes(30).seconds(0).valueOf();

        let isMeasureNotOnTime = new IsMeasureNotOnTime();

        isMeasureNotOnTime.check(stateEvent, (err, result)=>{
            expect(err).to.be.null;
            expect(result).to.be.false;
            done();
        });
    });

    it('should be true when the event is null', (done)=> {

        stateEvent.runAt = new Date(2016,9,10, 8,0,0).getTime();
        stateEvent.runAt = moment().hours(8).minutes(0).seconds(0).valueOf();
        event = null;

        let isMeasureNotOnTime = new IsMeasureNotOnTime();

        isMeasureNotOnTime.check(stateEvent, (err, result)=>{
            expect(err).to.be.null;
            expect(result).to.be.true;
            done();
        });
    });
});