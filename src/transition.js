/**
 * Created by victorcrudu on 11/05/2016.
 */
import _ from 'underscore';
import assert from 'assert';
import Rx from 'rx';
import logging from './logging';

class Transition {
    constructor(transitionConfig, actionFactory) {
        assert(transitionConfig.trigger, "Invalid transition config!");
        assert(transitionConfig.target, "Invalid transition config!");
        this._transitionConfig = transitionConfig;
        this._actionFactory = actionFactory;
    }

    getTrigger() {
        return this._transitionConfig.trigger;
    }

    getTarget() {
        return this._transitionConfig.target;
    }

    getTransitionConfig() {
        return this._transitionConfig;
    }

    runTransitionActions(user, event, callback) {

        let observable = Rx.Observable.create((observer)=> {

            if (!this._transitionConfig.actions || this._transitionConfig.actions.length === 0) observer.onCompleted();
            let n = 1;
            _.forEach(this._transitionConfig.actions, (action)=> {
                let actionObject = this._actionFactory.getAction(action.name, event, action.period, action.offset);
                if (actionObject) {
                    actionObject.do(event, (err)=> {
                        if (err) {
                            observer.onError(err);
                            return;
                        }
                        logging.getLogger().info('Transition action ' + action.name + 'of the trigger '+ this._transitionConfig.trigger + ' has executed successfully.');
                        if (n < this._transitionConfig.actions.length) {
                            observer.onNext();
                        } else {
                            logging.getLogger().info('All the actions for the transition '+this._transitionConfig.trigger+' has executed successfully.');
                            observer.onCompleted();
                            return;
                        }
                        n++;
                    });
                } else {
                    if (n < this._transitionConfig.actions.length) {
                        observer.onNext();
                    } else {
                        observer.onCompleted();
                        return;
                    }
                    n++;
                }
            });
        });

        observable.subscribe(()=> {
        }, (err)=> {
            callback(err);
        }, ()=> {
            callback();
        });
    }
}

export default Transition;