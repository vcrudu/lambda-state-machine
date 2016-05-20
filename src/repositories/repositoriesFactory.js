/**
 * Created by victorcrudu on 09/05/2016.
 */
import UserRepository from './userRepository';
import UserDetailsRepository from './userDetailsRepository';
import NotificationsRepository from './notificationsRepository';
import NotificationTemplatesRepository from './notificationTemplatesRepository';


class RepositoriesManager {
    constructor(){

    }

    getUserRepository(dynamoDb){
        return new UserRepository(dynamoDb);
    }

    getUserDetailsRepository(dynamoDb){
        return new UserDetailsRepository(dynamoDb);
    }



    getNotificationsRepository(dynamoDb){
        return new NotificationsRepository(dynamoDb);
    }

    getNotificationTemplatesRepository(dynamoDb){
        return new NotificationTemplatesRepository(dynamoDb);
    }
}

export default new RepositoriesManager();