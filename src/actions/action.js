/**
 * Created by victorcrudu on 10/05/2016.
 */
 
import awsFactory from '../awsFactory';
import repositoriesFactory from '../repositories/repositoriesFactory';
import moment from 'moment';
import momenttz from 'moment-timezone';
import _ from 'underscore';
import loggerProvider from '../logging';

class Action {
    constructor(name, notificationTemplateName, snsClient) {
        this._name = name;
        this._notificationTemplateName = notificationTemplateName;
        this._snsClient = snsClient;
    }

    getNotificationTemplateName() {
        return this._notificationTemplateName;
    }

    getName() {
        return this._name;
    }

    getSnsClient() {
        return this._snsClient;
    }

    setName(name) {
        this._name = name;
    }

    instantiateParameters(parametrizedString, bundle) {
        return parametrizedString
            .replace('{{userTitle}}', bundle.userTitle)
            .replace('{{userFullName}}', bundle.userFullName)
            .replace('{{providerTitle}}', bundle.providerTitle)
            .replace('{{providerFullName}}', bundle.providerFullName)
            .replace('{{providerType}}', bundle.providerType)
            .replace('{{measurementType}}', bundle.measurementType)
            .replace('{{groupName}}', bundle.groupName)
            .replace('{{approveLink}}', bundle.approveLink)
            .replace('{{time}}', bundle.appointmentDateTime ? momenttz(bundle.appointmentDateTime).tz("Europe/London").format('LT') : '')
            .replace('{{date}}', bundle.appointmentDateTime ? momenttz(bundle.appointmentDateTime).tz("Europe/London").format('LL') : '');
    }

    execAction(userId, event, callback) {

        let notificationTemplatesRepository = repositoriesFactory.getNotificationTemplatesRepository(awsFactory.getDb());
        let userRepository = repositoriesFactory.getUserRepository(awsFactory.getDb());
        let userDetailsRepository = repositoriesFactory.getUserDetailsRepository(awsFactory.getDb());
        userRepository.findOneByEmail(userId, (err, user)=> {
            if (!err) {
                userDetailsRepository.findOneByEmail(userId, (err, userDetails)=> {
                    if (!err) {
                        notificationTemplatesRepository.getOne(this._notificationTemplateName, (err, notificationTemplate)=> {
                            if (!err) {
                                let notification = this.buildTemplate(userDetails, user, event, notificationTemplate);

                                if (notificationTemplate.content.includes('{{providerFullName}}') && !event.payload.providerId) {
                                    callback(new Error('The provider was not specified!'));
                                    return;
                                }
                                this.SendNotification(notification, userId, callback);
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

    getMeasurementType(scheduleType) {
        switch (scheduleType) {
            case "bloodPressure": {
                return "Blood Pressure";
            }
            default: {
                return "";
            }
        }
    }

    buildTemplate(userDetails, user, event, notificationTemplate) {
        let instanceBundle = {
            userTitle: userDetails && userDetails.title ? userDetails.title : "",
            userFullName: user.name + ' ' + user.surname,
            providerTitle: event.payload.providerTitle,
            providerFullName: event.payload.providerFullName,
            providerType: event.payload.providerType,
            appointmentDateTime: event.payload.appointmentDateTime,
            measurementType: this.getMeasurementType(event.payload.scheduleType),
            groupName: event.payload.groupName,
            approveLink: event.payload.approveLink
        };

        let notification = {
            userId: user.email,
            dateTime: new Date().getTime(),
            category: notificationTemplate.category,
            content: this.instantiateParameters(notificationTemplate.content, instanceBundle),
            summary: this.instantiateParameters(notificationTemplate.summary, instanceBundle),
            title: notificationTemplate.title,
            imageLink: notificationTemplate.imageLink ? notificationTemplate.imageLink : 'https://s3-eu-west-1.amazonaws.com/trichrome/public/default.png',
            read: false,
            type: notificationTemplate.templateName,
            defaultAction: 'openMessage',
            responseAction: this._name
        };
        return notification;
    }

    SendNotification(notification, userId, callback) {
        let notificationsRepository = repositoriesFactory.getNotificationsRepository(awsFactory.getDb());

        notificationsRepository.save(notification, (err)=> {
            if (!err) {
                let snsEndpointsRepository = repositoriesFactory.getSnsEndpointsRepository(awsFactory.getDb());

                snsEndpointsRepository.getList(userId, (err, snsEndpoints)=> {
                    if (!snsEndpoints || snsEndpoints.length == 0) {
                        callback();
                        return;
                    }
                    let countOfProcessedEndpoints = 0;
                    _.forEach(snsEndpoints, (snsEndpoint)=> {
                        var params = {
                            Message: JSON.stringify({
                                userId: userId,
                                action: this._name,
                                notification: notification
                            }), /* required */
                            MessageAttributes: {
                                userId: {
                                    DataType: 'String',
                                    StringValue: userId /* required */
                                }
                            },
                            TargetArn: snsEndpoint.endpointArn
                        };
                        this._snsClient.publish(params, function (err, data) {
                            if (!err) {
                                loggerProvider.getLogger().info("Successfully sent the notification to " + userId + "for endpoint " + snsEndpoint.endpointArn);
                            } else {
                                loggerProvider.getLogger().error("Failed to send the notification to " + userId + " for endpoint " + snsEndpoint.endpointArn);
                            }
                            countOfProcessedEndpoints++;
                            if (countOfProcessedEndpoints == snsEndpoints.length) {
                                callback(null, data);
                            }
                        });
                    });
                });
            } else {
                callback(err);
            }
        });
    }

    do(event, callback) {
        this.execAction(event.payload.userId, event, callback);
    }
}

export default Action;