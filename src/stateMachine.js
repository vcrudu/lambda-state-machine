/**
 * Created by victorcrudu on 09/05/2016.
 */

    import logging from './logging';
import util from 'util';

class StateMachine {
    constructor(statesManager, userRepository) {
        this._statesManager = statesManager;
        this._userRepository = userRepository;
    }

    receiveEvent(event, callback) {
        if (!event.name || !event.payload || !event.payload.userId) {
            return;
        }

        this._userRepository.findOneByEmail(event.payload.userId, (err, user)=> {
            if (err || !user) {
                callback(new Error('Error retrieving the user from db!'));
                return;
            }
            if (!user.userState) {
                let startState = this._statesManager.getStartState();
                let stateName = startState.getStateName();
                this._userRepository.updateState(user.email, stateName, (err, data)=> {
                    if (err) {
                        callback(new Error('Error updating the user status!'));
                        return;
                    }

                    this._statesManager.runStateActions(stateName, event, (err)=> {
                        if (!err) {
                            logging.getLogger().info("User " + user.email + " has transitioned to the state - " + stateName);
                        } else {
                            logging.getLogger().error("User " + user.email + " has failed the transition to the state - " + stateName);
                        }

                        callback(err, data);
                    });
                });
            } else {
                if (this._statesManager.isTransitionValid(event.name, user.userState)) {
                    let currentState = this._statesManager.getState(user.userState);
                    let nextStateName = currentState.getNextStateName(event.name);
                    if (this._statesManager.isStateValid(nextStateName)) {
                        let nextState = this._statesManager.getState(nextStateName);

                        nextState.checkGuards(event, (err)=>{
                            if(err){
                                callback(new Error('Target state ' + nextStateName + ' could not be transitioned for event ' + event.name + ' from current' +
                                    ' user state ' + user.userState + 'due to not passing the guard ' + err));
                            } else {
                                this._statesManager.runTransitionActions(currentState.getStateName(), event.name, user, event, (err)=> {
                                    if (!err) {
                                        this._statesManager.runStateActions(nextStateName, event, (err)=> {
                                            if (!err) {
                                                this._userRepository.updateState(user.email, nextStateName, (err, data)=> {
                                                    if (!err) {
                                                        logging.getLogger().info("User " + user.email + " has transitioned to the state - " + nextStateName);
                                                    } else {
                                                        logging.getLogger().error("User " + user.email + " has failed the transition to the state - " + nextStateName);
                                                    }

                                                    callback(err, data);
                                                });
                                            } else {
                                                callback(new Error('Failed to run state actions when transitioning to ' + nextStateName + ' for event ' + event.name + ' from current' +
                                                    ' user state ' + user.userState + '!'));
                                            }
                                        });
                                    } else callback(new Error('Failed to run transition actions when transitioning to ' + nextStateName + ' for event ' + event.name + ' from current' +
                                        ' user state ' + user.userState + '!'));
                                });
                            }
                        });
                    } else callback(new Error('Target state ' + nextStateName + ' is not valid state for event ' + event.name + ' from current' +
                        ' user state ' + user.userState + '!'));
                } else {
                    //callback(new Error('No valid transition for event ' + event.name + ' for user state ' + user.userState + '!'));
                    //Temporary solution
                    let currentState = this._statesManager.getState("default");
                    let nextStateName = currentState.getNextStateName(event.name);
                    if (this._statesManager.isStateValid(nextStateName)) {
                        this._statesManager.runTransitionActions(currentState.getStateName(), event.name, user, event, (err)=> {
                            if (!err) {
                                this._statesManager.runStateActions(nextStateName, event, (err)=> {
                                    if (!err) {
                                        this._userRepository.updateState(user.email, nextStateName, (err, data)=> {
                                            if (!err) {
                                                logging.getLogger().info("User " + user.email + " has transitioned to the state - " + nextStateName);
                                            } else {
                                                logging.getLogger().error("User " + user.email + " has failed the transition to the state - " + nextStateName);
                                            }

                                            callback(err, data);
                                        });
                                    } else {
                                        callback(new Error('Failed to run state actions when transitioning to ' + nextStateName + ' for event ' + event.name + ' from current' +
                                            ' user state ' + user.userState + '!'));
                                    }
                                });
                            } else callback(new Error('Failed to run transition actions when transitioning to ' + nextStateName + ' for event ' + event.name + ' from current' +
                                ' user state ' + user.userState + '!'));
                        });

                    } else callback(new Error('Target state ' + nextStateName + ' is not valid state for event ' + event.name + ' from current' +
                        ' user state ' + user.userState + '!'));
                }
            }
        });
    }
}


export default StateMachine;