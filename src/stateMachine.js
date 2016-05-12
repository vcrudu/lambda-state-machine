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
                this._userRepository.updateState(user.email, this._statesManager.getStartState().name, (err)=> {
                    if (err) {
                        callback(new Error('Error updating the user status!'));
                        return;
                    }

                    let startState = this._statesManager.getStartState();

                    this._statesManager.runStateActions(startState, user, callback);
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
                                this._statesManager.runStateActions(nextStateName, user, callback);
                            }
                        });
                    }
                }
            }
        });
    }
}


export default StateMachine;