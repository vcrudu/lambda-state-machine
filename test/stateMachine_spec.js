/**
 * Created by victorcrudu on 09/05/2016.
 */

import chai from 'chai';
import sinon from 'sinon';
import path from 'path';
import ConfigManager from '../src/configManager';
import StateMachine from '../src/stateMachine';
import repositoriesFactory from '../src/repositories/repositoriesFactory'
import awsFactory from '../src/awsFactory';
import actionFactory from '../src/actions/actionFactory'
import StatesManager from '../src/statesManager';
import Action from '../src/actions/action';

describe('StateMachine',()=> {
    chai.should();
    let expect = chai.expect;
    let userId = 'test@test.com';
    let actionName = 'ActionSendWelcomeNotification';
    let filePath = path.resolve('.', './src/misc/patientStateMachine.json');
    let stateMachineConfig = ConfigManager.getLocalStateMachineConfig(filePath);
    let userState = null;
    let userRepository,spyUserRepositoryFindOneByEmail,spyUserRepositoryUpdateStatus,
        getActionStub,snsClientStub,statesManager, stateMachine,publishParams;

    var event = {
        name: "Any",
        payload: {userId: userId}
    };

    var getDynamoDbStub = function (userStateValue) {
        var dynamoDb = awsFactory.getDb();
        sinon.stub(dynamoDb, "getItem", (params, callback)=> {
            setTimeout( ()=> {
                if (userState) {
                    callback(null, {
                        Item: {
                            email: {S: userId},
                            name: {S: 'Test Testovici'},
                            userState: {S: userStateValue}
                        }
                    });
                }
                else {
                    callback(null, {
                        Item: {
                            email: {S: userId},
                            name: {S: 'Test Testovici'}
                        }
                    });
                }

            }, 0);
        });

        sinon.stub(dynamoDb, "updateItem", function (params, callback) {
            setTimeout( ()=> {
                callback(null, 'OK');
            }, 0);
        });

        return dynamoDb;
    };

   function initTest(eventName, userStateValue, actionNameValue) {

       event.name = eventName;
       userState = userStateValue;
       actionName = actionNameValue;
       publishParams = {
           Message: JSON.stringify({
               userId: userId,
               action: actionName
           }),
           MessageAttributes: {
               userId: {
                   DataType: 'String',
                   StringValue: userId
               }
           },
           TargetArn: 'arn:aws:sns:eu-west-1:160466482332:app/GCM/trichrome_health_monitor'
       };

       snsClientStub = {publish: sinon.stub()};
       snsClientStub.publish.yields(null, "ok");

       getActionStub = sinon.stub(actionFactory, 'getAction');
       getActionStub.withArgs('ActionSendWelcomeNotification').returns(new Action('ActionSendWelcomeNotification', 'welcomeMessage',snsClientStub));
       getActionStub.withArgs('ActionSendInformDevicesAvailable').returns(new Action('ActionSendInformDevicesAvailable', 'devicesAvailable', snsClientStub));
       getActionStub.withArgs('ActionSendInformCanMakeAppointments').returns(new Action('ActionSendInformCanMakeAppointments', 'canMakeAppointment',snsClientStub));
       getActionStub.withArgs('ActionSendInformProvideDetails').returns(new Action('ActionSendInformProvideDetails', 'provideDetails', snsClientStub));
       getActionStub.withArgs('ActionSendPatientAppointmentBookedNotification').returns(new Action('ActionSendPatientAppointmentBookedNotification','patientAppointmentBooked', snsClientStub));
       getActionStub.withArgs('ActionSendProviderAppointmentBookedNotification').returns(new Action('ActionSendProviderAppointmentBookedNotification','providerAppointmentBooked', snsClientStub));
       getActionStub.withArgs('ActionSendDevicesOrderedNotification').returns(new Action('ActionSendDevicesOrderedNotification', 'devicesOrdered', snsClientStub));
       getActionStub.withArgs('ActionSendDevicesDispatchedNotification').returns(new Action('ActionSendDevicesDispatchedNotification', 'devicesDispatched', snsClientStub));
       getActionStub.withArgs('ActionSendInstallDevicesNotification').returns(new Action('ActionSendInstallDevicesNotification', 'installDevices', snsClientStub));
       getActionStub.withArgs('ActionSendTakeMeasurementNotification').returns(new Action('ActionSendTakeMeasurementNotification','takeMeasurement', snsClientStub));

       userRepository = repositoriesFactory.getUserRepository(getDynamoDbStub(userState));

       spyUserRepositoryFindOneByEmail = sinon.spy(userRepository, "findOneByEmail");
       spyUserRepositoryUpdateStatus = sinon.spy(userRepository, "updateState");


       statesManager = new StatesManager(stateMachineConfig, actionFactory);
       stateMachine = new StateMachine(statesManager, userRepository, actionFactory);

   }


    describe('StateMachine receiveEvent and user has no state', () => {
        it('should set start state and execute ActionSendWelcomeNotification', (done)=> {
            initTest('Any', null, 'ActionSendWelcomeNotification');
            let expectedState=stateMachineConfig.start.name;
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateUnreadWelcome] and receive [OnReadWelcome] receiveEvent', () => {
        it('should set state to [StateWelcomed] and execute [ActionSendInformDevicesAvailable]', (done)=> {
            initTest('OnReadWelcome', 'StateUnreadWelcome','ActionSendInformDevicesAvailable');
            let expectedState = 'StateWelcomed';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateWelcomed] and receive [OnReadInformDevicesAvailable] receiveEvent', () => {
        it('should set state to [StateInformedDevicesAvailable] and execute [ActionSendInformCanMakeAppointments]', (done)=> {
            initTest('OnReadInformDevicesAvailable', 'StateWelcomed','ActionSendInformCanMakeAppointments');
            let expectedState = 'StateInformedDevicesAvailable';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateInformedDevicesAvailable] and receive [OnReadInformCanMakeAppointments] receiveEvent', () => {
        it('should set state to [StateInformedCanMakeAppointments] and execute [ActionSendInformProvideDetails]', (done)=> {
            initTest('OnReadInformCanMakeAppointments', 'StateInformedDevicesAvailable','ActionSendInformProvideDetails');
            let expectedState = 'StateInformedCanMakeAppointments';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateInformedCanMakeAppointments] and receive [OnReadInformProvideDetails] receiveEvent', () => {
        it('should set state to [StateAwaitingProvideDetails] and execute none', (done)=> {
            initTest('OnReadInformProvideDetails', 'StateInformedCanMakeAppointments',null);
            let expectedState = 'StateAwaitingProvideDetails';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.called).to.be.false;
                expect(snsClientStub.publish.called).to.be.false;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.false;
                done();
            });
        });
    });

    describe('StateMachine is in [StateAwaitingProvideDetails] and receive [OnProvideDetails] receiveEvent', () => {
        it('should set state to [StateIdle] and execute none', (done)=> {
            initTest('OnProvideDetails', 'StateAwaitingProvideDetails',null);
            let expectedState = 'StateIdle';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.called).to.be.false;
                expect(snsClientStub.publish.called).to.be.false;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.false;
                done();
            });
        });
    });

    describe('StateMachine is in [StateIdle] and receive [OnAppointmentBooking] receiveEvent', () => {
        it('should set state to [StateAppointmentBooked] and execute [ActionSendPatientAppointmentBookedNotification]' +
            ' and [ActionSendProviderAppointmentBookedNotification]', (done)=> {
            initTest('OnAppointmentBooking', 'StateIdle', 'ActionSendPatientAppointmentBookedNotification');
            let expectedState = 'StateAppointmentBooked';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledTwice).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledTwice).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                publishParams.Message = JSON.stringify({
                    userId: userId,
                    action: 'ActionSendProviderAppointmentBookedNotification'
                });
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateAppointmentBooked] and receive [OnOneMinuteRemained] receiveEvent', () => {
        it('should set state to [StateInformedNotificationSoon] and execute none', (done)=> {
            initTest('OnOneMinuteRemained', 'StateAppointmentBooked',null);
            let expectedState = 'StateInformedNotificationSoon';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.called).to.be.false;
                expect(snsClientStub.publish.called).to.be.false;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.false;
                done();
            });
        });
    });

    describe('StateMachine is in [StateInformedNotificationSoon] and receive [OnReadNotificationSoon] receiveEvent', () => {
        it('should set state to [StateIdle] and execute none', (done)=> {
            initTest('OnReadNotificationSoon', 'StateInformedNotificationSoon',null);
            let expectedState = 'StateIdle';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.called).to.be.false;
                expect(snsClientStub.publish.called).to.be.false;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.false;
                done();
            });
        });
    });

    describe('StateMachine is in [StateIdle] and receive [OnDevicesOrdering] receiveEvent', () => {
        it('should set state to [StateDevicesOrdered] and execute [ActionSendDevicesOrderedNotification]', (done)=> {
            initTest('OnDevicesOrdering', 'StateIdle','ActionSendDevicesOrderedNotification');
            let expectedState = 'StateDevicesOrdered';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateDevicesOrdered] and receive [OnDevicesDispatching] receiveEvent', () => {
        it('should set state to [StateDevicesDispatched] and execute [ActionSendDevicesDispatchedNotification]', (done)=> {
            initTest('OnDevicesDispatching', 'StateDevicesOrdered','ActionSendDevicesDispatchedNotification');
            let expectedState = 'StateDevicesDispatched';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateDevicesDispatched] and receive [OnDevicesDelivering] receiveEvent', () => {
        it('should set state to [StateDevicesDelivered] and execute [ActionSendInstallDevicesNotification]', (done)=> {
            initTest('OnDevicesDelivering', 'StateDevicesDispatched','ActionSendInstallDevicesNotification');
            let expectedState = 'StateDevicesDelivered';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateDevicesDelivered] and receive [OnDevicesInstalled] receiveEvent', () => {
        it('should set state to [StateWaitingMeasurement] and execute [ActionSendTakeMeasurementNotification]', (done)=> {
            initTest('OnDevicesInstalled', 'StateDevicesDelivered','ActionSendTakeMeasurementNotification');
            let expectedState = 'StateWaitingMeasurement';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.calledOnce).to.be.true;
                expect(getActionStub.calledWith(actionName)).to.be.true;
                expect(snsClientStub.publish.calledOnce).to.be.true;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.true;
                done();
            });
        });
    });

    describe('StateMachine is in [StateWaitingMeasurement] and receive [OnMeasurementReceived] receiveEvent', () => {
        it('should set state to [StateIdle] and execute none', (done)=> {
            initTest('OnMeasurementReceived', 'StateWaitingMeasurement',null);
            let expectedState = 'StateIdle';
            stateMachine.receiveEvent(event, function () {
                expect(spyUserRepositoryFindOneByEmail.calledOnce).to.be.true;
                expect(spyUserRepositoryFindOneByEmail.calledWith(event.payload.userId)).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledOnce).to.be.true;
                expect(spyUserRepositoryUpdateStatus.calledWith(userId, expectedState)).to.be.true;
                expect(getActionStub.called).to.be.false;
                expect(snsClientStub.publish.called).to.be.false;
                //expect(snsClientStub.publish.calledWith(publishParams)).to.be.false;
                done();
            });
        });
    });

    afterEach(()=> {
        getActionStub.restore();
        spyUserRepositoryFindOneByEmail.restore();
        spyUserRepositoryUpdateStatus.restore();
    });
});