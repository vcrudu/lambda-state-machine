/**
 * Created by victorcrudu on 09/05/2016.
 */
import UserRepository from './userRepository';
import UserDetailsRepository from './userDetailsRepository';
import NotificationsRepository from './notificationsRepository';
import NotificationTemplatesRepository from './notificationTemplatesRepository';
import SnsEndpointsRepository from './snsEndpointsRepository'


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

    getSnsEndpointsRepository(dynamoDb){
        return new SnsEndpointsRepository(dynamoDb);
    }

    
}

export default new RepositoriesManager();