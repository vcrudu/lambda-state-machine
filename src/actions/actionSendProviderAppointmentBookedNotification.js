/**
 * Created by victorcrudu on 10/05/2016.
 */

import Action from './action';
import awsFactory from '../awsFactory';
import repositoriesFactory from '../repositories/repositoriesFactory';

class ActionSendProviderAppointmentBookedNotification extends Action {
    constructor(name, notificationTemplateName, snsClient) {
        super(name, notificationTemplateName, snsClient);
    }

    buildTemplate(userDetails, user, event, notificationTemplate) {
        let instanceBundle = {
            userTitle: userDetails && userDetails.title ? userDetails.title : "",
            userFullName: user.name + ' ' + user.surname,
            providerTitle: event.payload.providerTitle,
            providerFullName: event.payload.providerFullName,
            providerType: event.payload.providerType,
            appointmentDateTime: event.payload.appointmentDateTime
        };

        let notification = {
            userId: event.payload.providerId,
            dateTime: new Date().getTime(),
            category: notificationTemplate.category,
            content: super.instantiateParameters(notificationTemplate.content, instanceBundle),
            summary: super.instantiateParameters(notificationTemplate.summary, instanceBundle),
            title: notificationTemplate.title,
            imageLink: notificationTemplate.imageLink ? notificationTemplate.imageLink : 'https://s3-eu-west-1.amazonaws.com/trichrome/public/default.png',
            read: false,
            type: notificationTemplate.templateName,
            defaultAction: 'openMessage',
            responseAction: super.getName()
        };
        return notification;
    }

    execAction(userId, event, callback) {

        let awsDb = awsFactory.getDb();
        let notificationTemplatesRepository = repositoriesFactory.getNotificationTemplatesRepository(awsDb);
        let userRepository = repositoriesFactory.getUserRepository(awsDb);
        let userDetailsRepository = repositoriesFactory.getUserDetailsRepository(awsDb);
        userRepository.findOneByEmail(userId, (err, user)=> {
            if (!err) {
                userDetailsRepository.findOneByEmail(userId, (err, userDetails)=> {
                    if (!err) {
                        notificationTemplatesRepository.getOne(super.getNotificationTemplateName(), (err, notificationTemplate)=> {
                            if (!err) {
                                let notification = this.buildTemplate(userDetails, user, event, notificationTemplate);

                                if (notificationTemplate.content.includes('{{providerFullName}}') && !event.payload.providerId) {
                                    callback(new Error('The provider was not specified!'));
                                    return;
                                }
                                super.SendNotification(notification, event.payload.providerId, callback);
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                });
            } else {
                callback(err);
            }
        });
    }

    do(event, callback) {
        if (!event.payload.providerId
            || !event.payload.providerTitle
            || !event.payload.providerFullName
            || !event.payload.providerType
            || !event.payload.appointmentDateTime) {
            callback(new Error('The appointment details were not specified!'));
            return;
        }
        this.execAction(event.payload.userId, event, callback);
    }
}

export default ActionSendProviderAppointmentBookedNotification;