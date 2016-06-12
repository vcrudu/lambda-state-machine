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
        statesManager = {
            getStateMachineConfig: getStateMachineConfigStub,
            getStartState: getStartStateStub,
            getState: getStateStub,
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
            let startState = {getStateName:sinon.stub()};
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
            let user = {userState:"OK"};
            let stateName = "stateName";
            let currentState = {getNextStateName:sinon.stub(), getStateName : sinon.stub()};
            currentState.getNextStateName.returns(stateName);

            statesManager.getState.returns(currentState);
            runTransitionActionsStub.yields(null);
            findOneByEmailStub.yields(null, user);
            updateStateStub.yields(null);
            runStateActionsStub.yields(null, "OK");
            isTransitionValidStub.returns(true);
            isStateValidStub.withArgs(stateName).returns(true);

            stateMachine.receiveEvent(event, function () {
                expect(getStartStateStub.called).to.be.false;
                expect(updateStateStub.calledOnce).to.be.true;
                expect(runStateActionsStub.calledOnce).to.be.true;
                expect(runTransitionActionsStub.calledOnce).to.be.true;
                expect(runStateActionsStub.calledWith(stateName, event)).to.be.true;
                done();
            });
        });
    });

});