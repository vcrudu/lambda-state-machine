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
    let filePath = path.resolve('.', './src/misc/patientStateMachine.group.json');
    let stateMachineConfig = ConfigManager.getLocalStateMachineConfig(filePath);
    let userState = null;
    let userRepository;
    let findOneByEmailStub;
    let updateStateStub;
    let user;

    let getStateMachineConfigStub;
    let getStartStateStub;
    let getStateStub;
    let isStateValidStub;
    let isTransitionValidStub;
    let runStateActionsStub;
    let statesManager;
    let stateMachine;
    let runTransitionActionsStub;
    let checkGuardsStub;

    var event = {
        name: "Any",
        payload: {userId: userId}
    };

    beforeEach(()=> {

        getStateMachineConfigStub = sinon.stub();
        getStartStateStub = sinon.stub();
        getStateStub = sinon.stub();
        isStateValidStub = sinon.stub();
        isTransitionValidStub = sinon.stub();
        runStateActionsStub = sinon.stub();
        runTransitionActionsStub = sinon.stub();
        checkGuardsStub = sinon.stub();
        statesManager = {
            getStateMachineConfig: getStateMachineConfigStub,
            getStartState: getStartStateStub,
            getState: getStateStub,
            checkGuards: checkGuardsStub,
            isStateValid: isStateValidStub,
            isTransitionValid: isTransitionValidStub,
            runStateActions: runStateActionsStub,
            runTransitionActions: runTransitionActionsStub
        };

        findOneByEmailStub = sinon.stub();


        updateStateStub = sinon.stub();

        userRepository = {
            findOneByEmail: findOneByEmailStub,
            updateState: updateStateStub
        };

        stateMachine = new StateMachine(statesManager, userRepository);

    });

    afterEach(()=> {

        getStateMachineConfigStub = null;
        getStartStateStub = null;
        getStateStub = null;
        isStateValidStub = null;
        isTransitionValidStub = null;
        runStateActionsStub = null;
        statesManager = null;

    });

    describe('StateMachine receiveEvent and user has no state', () => {
        it('should do nothing', (done)=> {
            findOneByEmailStub.yields("Error", null);

            stateMachine.receiveEvent(event, function (err) {

                expect(err).to.be.ok;
                expect(runStateActionsStub.called).to.be.false;
                done();
            });
        });
    });

    describe('user does not have state', () => {
        it('should set state to [StateUnreadWelcome] and execute [ActionSendWelcomeNotification]', (done)=> {

            let user = {};
            let stateName = "stateName";
            let startState = {getStateName: sinon.stub()};
            startState.getStateName.returns("stateName");
            statesManager.getStartState.returns(startState);
            findOneByEmailStub.yields(null, user);
            updateStateStub.yields(null);
            runStateActionsStub.yields(null, "OK");


            stateMachine.receiveEvent(event, function () {
                expect(getStartStateStub.calledOnce).to.be.true;
                expect(runStateActionsStub.calledOnce).to.be.true;
                expect(runStateActionsStub.calledWith(stateName, event)).to.be.true;
                done();
            });
        });
    });

    describe('user has state', () => {
        it('should set state to next state', (done)=> {
            let nextStateName = "nextStateName";

            let user = {userState: "currentStateName"};
            let currentStateName = 'currentStateName';
            let currentState = {getNextStateName: sinon.stub().returns(nextStateName), getStateName: sinon.stub().returns(currentStateName)};
            let nextState = {checkGuards: sinon.stub().callsArgWith(1)};
            currentState.getNextStateName.returns(nextStateName);

            statesManager.getState.withArgs(nextStateName).returns(nextState);
            statesManager.getState.withArgs(currentStateName).returns(currentState);
            runTransitionActionsStub.yields(null);
            findOneByEmailStub.yields(null, user);
            updateStateStub.yields(null);
            runStateActionsStub.yields(null, "OK");
            isTransitionValidStub.returns(true);
            isStateValidStub.withArgs(nextStateName).returns(true);

            stateMachine.receiveEvent(event, function (err) {
                expect(getStartStateStub.called).to.be.false;
                expect(updateStateStub.calledOnce).to.be.true;
                expect(runStateActionsStub.calledOnce).to.be.true;
                expect(runTransitionActionsStub.calledWith(currentStateName)).to.be.true;
                expect(runStateActionsStub.calledWith(nextStateName, event)).to.be.true;
                expect(nextState.checkGuards.calledOnce).to.be.true;
                expect(err).to.be.a('null');
                done();
            });
        });
    });

    describe('Check guard return error', () => {
        it('should not change the state', (done)=> {
            let nextStateName = "nextStateName";

            let user = {userState: "currentStateName"};
            let currentStateName = 'currentStateName';
            let currentState = {getNextStateName: sinon.stub().returns(nextStateName), getStateName: sinon.stub().returns(currentStateName)};
            let nextState = {checkGuards: sinon.stub().callsArgWith(1, 'err')};
            currentState.getNextStateName.returns(nextStateName);

            statesManager.getState.withArgs(nextStateName).returns(nextState);
            statesManager.getState.withArgs(currentStateName).returns(currentState);
            runTransitionActionsStub.yields(null);
            findOneByEmailStub.yields(null, user);
            updateStateStub.yields(null);
            runStateActionsStub.yields(null, "OK");
            isTransitionValidStub.returns(true);
            isStateValidStub.withArgs(nextStateName).returns(true);

            stateMachine.receiveEvent(event, function (err) {
                expect(getStartStateStub.called).to.be.false;
                expect(updateStateStub.calledOnce).to.be.false;
                expect(runStateActionsStub.calledOnce).to.be.false;
                expect(runTransitionActionsStub.calledWith(currentStateName)).to.be.false;
                expect(runStateActionsStub.calledWith(nextStateName, event)).to.be.false;
                expect(nextState.checkGuards.calledOnce).to.be.true;
                expect(err).to.not.be.a('null');
                done();
            });
        });
    });

});