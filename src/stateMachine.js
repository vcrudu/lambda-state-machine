/**
 * Created by victorcrudu on 09/05/2016.
 */

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
                this._userRepository.updateState(user.email, startState.getStateName(), (err)=> {
                    if (err) {
                        callback(new Error('Error updating the user status!'));
                        return;
                    }

                    let startState = this._statesManager.getStartState();

                    this._statesManager.runStateActions(startState.getStateName(), user, event, callback);
                });
            } else {
                if (this._statesManager.isTransitionValid(event.name, user.userState)) {
                    var currentState = this._statesManager.getState(user.userState);
                    let nextStateName = currentState.getNextStateName(event.name);
                    if (this._statesManager.isStateValid(nextStateName)) {
                        this._userRepository.updateState(user.email, nextStateName, (err)=> {
                            if (err) {
                                callback(new Error('Error updating the user state!'));
                            } else {
                                this._statesManager.runStateActions(nextStateName, user, event, callback);
                            }
                        });
                    } else callback(new Error('Target state '+ nextStateName +' is not valid state for event '+event.name+' from current' +
                        ' user state '+user.userState+'!'));
                } else callback(new Error('No valid transition for event '+event.name+' for user state '+user.userState+'!'));
            }
        });
    }
}


export default StateMachine;