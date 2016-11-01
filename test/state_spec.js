/**
 * Created by victorcrudu on 11/05/2016.
 */

import chai from 'chai';
import sinon from 'sinon';
import State from '../src/state';
import actionFactory from '../src/actions/actionFactory';
import Action from '../src/actions/action';
import guardFactory from '../src/guards/guardFactory';
import util from 'util';


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
            expect(transition.getTrigger()).to.be.equal(stateConfig.transitions[0].trigger);

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

    describe('State.checkGuards', ()=> {
        it('should return true', (done)=> {

            let stateConfig = {
                name: "TestState",
                entryGuards: ['entryGuard1', 'entryGuard2'],
                exitGuards: ['exitGuard1', 'exitGuard2'],
                transitions: [{
                    trigger: "OnTestEvent",
                    target: "TestTarget"
                }],
                actions: []
            };

            let getGuardStub = sinon.stub(guardFactory, "getGuard");

            let entryGuard1 = {
                check: sinon.stub().callsArgWith(1, true)
            };

            let entryGuard2 = {
                check: sinon.stub().callsArgWith(1, true)
            };

            let exitGuard1 = {
                check: sinon.stub().callsArgWith(1, true)
            };

            let exitGuard2 = {
                check: sinon.stub().callsArgWith(1, true)
            };

            getGuardStub.withArgs('entryGuard1').returns(entryGuard1);
            getGuardStub.withArgs('entryGuard2').returns(entryGuard2);
            getGuardStub.withArgs('exitGuard1').returns(exitGuard1);
            getGuardStub.withArgs('exitGuard2').returns(exitGuard2);

            let state = new State(stateConfig, actionFactory);
            state.checkGuards({}, (err, arg1)=>{
                expect(arg1).to.be.true;
                getGuardStub.restore();
                done();
            })

        });

        it('should return error and false', (done)=> {

            let stateConfig = {
                name: "TestState",
                entryGuards: ['entryGuard1', 'entryGuard2'],
                exitGuards: ['exitGuard1', 'exitGuard2'],
                transitions: [{
                    trigger: "OnTestEvent",
                    target: "TestTarget"
                }],
                actions: []
            };

            let getGuardStub = sinon.stub(guardFactory, "getGuard");

            let entryGuard1 = {
                check: sinon.stub().callsArgWith(1, true),
                name:  'entryGuard1'
            };

            let entryGuard2 = {
                check: sinon.stub().callsArgWith(1, false),
                name:  'entryGuard2'
            };

            let exitGuard1 = {
                check: sinon.stub().callsArgWith(1, true),
                name:  'exitGuard1'
            };

            let exitGuard2 = {
                check: sinon.stub().callsArgWith(1, true),
                name:  'exitGuard2'
            };

            getGuardStub.withArgs('entryGuard1').returns(entryGuard1);
            getGuardStub.withArgs('entryGuard2').returns(entryGuard2);
            getGuardStub.withArgs('exitGuard1').returns(exitGuard1);
            getGuardStub.withArgs('exitGuard2').returns(exitGuard2);

            let state = new State(stateConfig, actionFactory);
            state.checkGuards({}, (err, arg1)=>{
                expect(err).to.equal('entryGuard2');
                expect(arg1).to.be.false;
                getGuardStub.restore();
                done();
            })

        });
    });
});