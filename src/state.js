/**
 * Created by victorcrudu on 11/05/2016.
 */
import _ from 'underscore';
import assert from 'assert';
import Rx from 'rx';

class State{
    constructor(stateConfig, actionFactory){
        assert(stateConfig.transitions,"Invalid state config!");
        this._stateConfig = stateConfig;
        this._actionFactory = actionFactory;
    }

    getStateConfig(){
        return this._stateConfig;
    }

    getNextStateName(eventName) {
        var result = _.find(this._stateConfig.transitions, function (transition) {
            return transition.trigger === eventName;
        });

        return result ? result.target : null;
    }

    getTransition(eventName){
        var result = _.find(this._stateConfig.transitions, function (transition) {
            return transition.trigger === eventName;
        });

        return result;
    }

    runStateActions(user, callback) {

        let observable = Rx.Observable.create((observer)=> {
            let n = 1;
            _.forEach(this._stateConfig.actions,  (action)=> {
                let actionObject = this._actionFactory.getAction(action.name);
                actionObject.do(user.email,  (err)=> {
                    if (err){
                        observer.onError(err);
                        return;
                    }
                    if (n < this._stateConfig.actions.length) {
                        observer.onNext();
                    } else {
                        observer.onCompleted();
                        return;
                    }
                    n++;
                });
            });
        });

        observable.subscribe(()=>{}, (err)=> {
            callback(err);
        }, ()=> {
            callback();
        });
    }
}

export default State;