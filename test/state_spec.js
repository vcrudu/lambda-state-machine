/**
 * Created by victorcrudu on 11/05/2016.
 */

import chai from 'chai';
import sinon from 'sinon';
import State from '../src/state';
import actionFactory from '../src/actions/actionFactory';
import Action from '../src/actions/action';

describe('State class',()=> {
    var expect = chai.expect;
    describe('State.getNextStateName', ()=> {
        it('should return next state', ()=> {

            var stateConfig = {
                name: "TestState",
                transitions: [{
                    trigger: "OnTestEvent",
                    target: "TestTarget"
                }],
                actions: [{
                    name: "ActionTest"
                }]
            };

            var state = new State(stateConfig);

            var nextStateName = state.getNextStateName(stateConfig.transitions[0].trigger);
            expect(nextStateName).to.be.equal(stateConfig.transitions[0].target);

        });
    });

    describe('State.getTransition', ()=> {
        it('should return transition', ()=> {

            var stateConfig = {
                name: "TestState",
                transitions: [{
                    trigger: "OnTestEvent",
                    target: "TestTarget"
                }],
                actions: [{
                    name: "ActionTest"
                }]
            };

            var state = new State(stateConfig);
            expect(state).to.be.ok;

            var transition = state.getTransition(stateConfig.transitions[0].trigger);
            expect(transition.trigger).to.be.equal(stateConfig.transitions[0].trigger);

        });
    });

    describe('State.runStateActions', ()=> {
        it('should run all state actions', (done)=> {

            let stateConfig = {
                name: "TestState",
                transitions: [{
                    trigger: "OnTestEvent",
                    target: "TestTarget"
                }],
                actions: [{
                    name: "ActionTest1"
                },{
                    name: "ActionTest2"
                }]
            };

            let getActionStub = sinon.stub(actionFactory, 'getAction');
            let action1 = new Action();
            let action2 = new Action();
            let action1DoStub = sinon.stub(action1, 'do');
            action1DoStub.yields(null, null);
            let action2DoStub = sinon.stub(action2, 'do');
            action2DoStub.yields(null, null);

            getActionStub.withArgs("ActionTest1").returns(action1);
            getActionStub.withArgs("ActionTest2").returns(action2);

            let state = new State(stateConfig, actionFactory);
            state.runStateActions({}, ()=>{
                expect(action1DoStub.called).to.be.true;
                expect(action2DoStub.called).to.be.true;
                getActionStub.restore();
                done();
            })

        });
    });

    describe('State.runStateActions', ()=> {
        it('should run all state actions', (done)=> {

            let stateConfig = {
                name: "TestState",
                transitions: [{
                    trigger: "OnTestEvent",
                    target: "TestTarget"
                }],
                actions: []
            };

            let getActionStub = sinon.stub(actionFactory, 'getAction');
            let action1 = new Action();
            let action2 = new Action();
            let action1DoStub = sinon.stub(action1, 'do');
            action1DoStub.yields(null, null);
            let action2DoStub = sinon.stub(action2, 'do');
            action2DoStub.yields(null, null);

            getActionStub.withArgs("ActionTest1").returns(action1);
            getActionStub.withArgs("ActionTest2").returns(action2);

            let state = new State(stateConfig, actionFactory);
            state.runStateActions({}, (arg1, arg2)=>{
                expect(arg1).to.be.undefined;
                expect(arg2).to.be.undefined;
                getActionStub.restore();
                done();
            })

        });
    });
});