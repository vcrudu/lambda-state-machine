/**
 * Created by victorcrudu on 10/05/2016.
 */

import _ from 'underscore';
import State from './state';

class StatesManager {
    constructor(stateMachineConfig, actionFactory) {
        this._stateMachineConfig = stateMachineConfig;
        this._actionFactory = actionFactory;
    }

    getStateMachineConfig() {
        return this._stateMachineConfig;
    }

    getStartState() {
        return new State(this._stateMachineConfig.start, this._actionFactory);
    }

    getState(name) {
        if (name === "start") return new State(this._stateMachineConfig.start,this._actionFactory);
        else {
            var result = _.find(this._stateMachineConfig.states, function (state) {
                return state.name === name;
            });

            return result ? new State(result, this._actionFactory) : null;
        }

    }

    isStateValid(name) {
        let result = _.find(this._stateMachineConfig.states, function (state) {
            return state.name === name;
        });

        return !!result;
    }

    isTransitionValid(eventName, currentStateName) {
        let currentState = this.getState(currentStateName);
        if (!currentState) return false;
        let transition = currentState.getTransition(eventName);
        if (transition) {
            let result = _.find(this._stateMachineConfig.states, function (aState) {
                return aState.name === transition.target;
            });
            return result ? true : false;
        } else return false;
    }

    runStateActions(name, user, callback) {

        let state = this.getState(name);
        state.runStateActions(user, callback);
        
    }
}

export default StatesManager;