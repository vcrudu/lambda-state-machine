/**
 * Created by victorcrudu on 11/05/2016.
 */


import chai from 'chai';
import StatesManager from '../src/statesManager';
import State from '../src/state';
import actionFactory from '../src/actions/actionFactory';

describe('StatesManager class',()=> {
    var expect = chai.expect;
    describe('StatesManager.getStateMachineConfig', ()=> {
        it('should return stateMachineConfig', ()=> {

            var stateMachineConfig = "stateMachineConfig";

            var statesManager = new StatesManager(stateMachineConfig);

            var returnedStateMachineConfig = statesManager.getStateMachineConfig();
            expect(returnedStateMachineConfig).to.be.equal(stateMachineConfig);

        });
    });

    describe('StatesManager.getStartState', ()=> {
        it('should return start state', ()=> {

            var stateMachineConfig = {
                start: {
                    name:"startState",
                    transitions:[]
                }
            };

            var statesManager = new StatesManager(stateMachineConfig, actionFactory);

            var returnedStartState = statesManager.getStartState();
            expect(returnedStartState).to.be.deep.equal(new State(stateMachineConfig.start, actionFactory));
        });
    });

    describe('StatesManager.getState', ()=> {
        it('should return start state', ()=> {

            var stateMachineConfig = {
                start: {
                    name:"startState",
                    transitions:[]
                }
            };

            var statesManager = new StatesManager(stateMachineConfig, actionFactory);

            var returnedStartState = statesManager.getState("start");
            expect(returnedStartState).to.be.deep.equal(new State(stateMachineConfig.start,actionFactory));

        });
    });

    describe('StatesManager.getState', ()=> {
        it('should return not start state', ()=> {

            var stateMachineConfig = {
                start: "startState",
                states: [{
                    name: "test",
                    transitions: []
                }]
            };

            var statesManager = new StatesManager(stateMachineConfig, actionFactory);

            var returnedState = statesManager.getState("test");
            expect(returnedState).to.be.deep.equal(new State(stateMachineConfig.states[0],actionFactory));

        });
    });

    describe('StatesManager.isStateValid', ()=> {
        it('should return true', ()=> {

            var stateMachineConfig = {
                start: "startState",
                states: [{
                    name: "test",
                    transitions: []
                }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isStateValid("test");
            expect(result).to.be.true;

        });

        it('should return false', ()=> {

            var stateMachineConfig = {
                start: "startState",
                states: [{
                    name: "test",
                    transitions: []
                }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isStateValid("test1");
            expect(result).to.be.false;

        });
    });

    describe('StatesManager.isTransitionValid', ()=> {
        it('should return true', ()=> {

            var stateMachineConfig = {
                start: {
                    name: "startState",
                    transitions: []
                },
                states: [{
                    name: "startState",
                    transitions: []
                },
                    {
                        name: "test",
                        transitions: [{
                            trigger: "OnTest",
                            target: "NextState"
                        }]
                    },
                    {
                        name: "NextState",
                        transitions: []
                    }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isTransitionValid("OnTest", stateMachineConfig.states[1].name);
            expect(result).to.be.true;

        });
    });

    describe('StatesManager.isTransitionValid', ()=> {
        it('should return false because no such destination state', ()=> {

            var stateMachineConfig = {
                start: {
                    name:"startState",
                    transitions:[]
                },
                states: [{
                    name: "test",
                    transitions: [{
                        trigger: "OnTest",
                        target: "NextState1"
                    }]
                },
                    {
                        name: "NextState",
                        transitions: []
                    }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isTransitionValid("OnTest", stateMachineConfig.states[0].name);
            expect(result).to.be.false;

        });
    });

    describe('StatesManager.isTransitionValid', ()=> {
        it('should return false because no such trigger', ()=> {

            var stateMachineConfig = {
                start: {
                    name: "startState",
                    transitions: []
                },
                states: [{
                    name: "test",
                    transitions: [{
                        trigger: "OnTest1",
                        target: "NextState"
                    }]
                },
                    {
                        name: "NextState",
                        transitions: []
                    }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isTransitionValid("OnTest", stateMachineConfig.states[0].name);
            expect(result).to.be.false;

        });
    });

    describe('StatesManager.isTransitionValid', ()=> {
        it('should return false because no such current state', ()=> {

            var stateMachineConfig = {
                start: {
                    name:"startState",
                    transitions:[]
                },
                states: [{
                    name: "test",
                    transitions: [{
                        trigger: "OnTest1",
                        target: "NextState"
                    }]
                },
                    {
                        name: "NextState",
                        transitions: []
                    }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isTransitionValid("OnTest", "test1");
            expect(result).to.be.false;

        });
    });

    describe('StatesManager.isTransitionValid', ()=> {
        it('should return false because no such current state', ()=> {

            var stateMachineConfig = {
                start: {
                    name:"startState",
                    transitions:[]
                },
                states: [{
                    name: "test",
                    transitions: [{
                        trigger: "OnTest1",
                        target: "NextState"
                    }]
                },
                    {
                        name: "NextState",
                        transitions: []
                    }]
            };

            var statesManager = new StatesManager(stateMachineConfig);

            var result = statesManager.isTransitionValid("OnTest", "test1");
            expect(result).to.be.false;

        });
    });
});