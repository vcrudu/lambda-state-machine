/**
 * Created by victorcrudu on 11/05/2016.
 */
import _ from 'underscore';
import assert from 'assert';
import Rx from 'rx';
import Transition from './transition';
import logging from './logging';
import guardFactory from './guards/guardFactory'

class State {
    constructor(stateConfig, actionFactory) {
        assert(stateConfig.transitions, "Invalid state config!");
        this._stateConfig = stateConfig;
        this._actionFactory = actionFactory;
        this._guards = [];
        if (this._stateConfig.entryGuards) {
            this._guards = this._guards.concat(this._stateConfig.entryGuards.map(guardName=> {
                return guardFactory.getGuard(guardName);
            }));
        }

        if (this._stateConfig.exitGuards) {
            this._guards = this._guards.concat(this._stateConfig.exitGuards.map(guardName=> {
                return guardFactory.getGuard(guardName);
            }));
        }
    }

    getStateName() {
        return this._stateConfig.name;
    }

    getStateConfig() {
        return this._stateConfig;
    }

    getNextStateName(eventName) {
        var result = _.find(this._stateConfig.transitions, function (transition) {
            return transition.trigger === eventName;
        });

        return result ? result.target : null;
    }

    getTransition(eventName) {
        var result = _.find(this._stateConfig.transitions, function (transition) {
            return transition.trigger === eventName;
        });

        return result ? new Transition(result, this._actionFactory) : null;
    }

    checkGuards(event, callback) {
        let observable = Rx.Observable.create((observer)=> {
            if (this._guards.length === 0) {
                observer.onCompleted();
            } else {
                let countOfProcessedGuards = 0;
                this._guards.forEach((guard)=> {
                    guard.check(event, (result)=> {
                        if (!result) {
                            observer.onError(guard.name);
                            return;
                        }
                        countOfProcessedGuards++;
                        if (countOfProcessedGuards === this._guards.length) {
                            observer.onCompleted();
                        }
                    });
                }, this);
            }
        });

        observable.subscribe(
            ()=> {
            },
            (err)=>callback(err, false),
            ()=>callback(null, true));

    }

    runStateActions(event, callback) {

        let observable = Rx.Observable.create((observer)=> {

            if (!this._stateConfig.actions || this._stateConfig.actions.length === 0) {
                observer.onCompleted();
                return;
            }
            logging.getLogger().debug("Number of acions:" + this._stateConfig.actions.length);
            let n = 0;
            _.forEach(this._stateConfig.actions, (action)=> {
                let actionObject = this._actionFactory.getAction(action.name, event, action.period, action.offset);
                if (actionObject) {
                    actionObject.do(event, (err)=> {
                        n++;
                        if (err) {
                            logging.getLogger().error(err);
                            logging.getLogger().error(new Error("The action " + action.name + "has failed to execute!"));
                        } else {
                            logging.getLogger().info("The action " + action.name + "has been executed successfully!");
                        }

                        observer.onNext();

                        if (n >= this._stateConfig.actions.length) {
                            logging.getLogger().debug("Successfully finished all the actions!");
                            observer.onCompleted();
                        }
                    });
                } else {
                    n++;
                    observer.onNext();
                    if (n >= this._stateConfig.actions.length) {
                        observer.onCompleted();
                        return;
                    }
                }
            });
        });

        observable.subscribe(()=> {
        }, ()=> {
        }, ()=> {
            callback();
        });
    }
}

export default State;