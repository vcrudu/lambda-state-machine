/**
 * Created by victorcrudu on 09/05/2016.
 */
import UserRepository from './userRepository';

class RepositoriesManager {
    constructor(){

    }

    getUserRepository(dynamoDb){
        return new UserRepository(dynamoDb);
    }
}

export default new RepositoriesManager();