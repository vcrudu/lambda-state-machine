/**
 * Created by victorcrudu on 10/05/2016.
 */
 
import awsFactory from '../awsFactory';
import repositoriesFactory from '../repositories/repositoriesFactory';
import moment from 'moment';
import _ from 'underscore';
import loggerProvider from '../logging';

class Action {
    constructor(name, notificationTemplateName, snsClient) {
        this._name = name;
        this._notificationTemplateName = notificationTemplateName;
        this._snsClient = snsClient;
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

    execAction(userId, event, callback) {
        function instantiateParameters(parametrizedString, bundle) {
            return parametrizedString
                .replace('{{userTitle}}', bundle.userTitle)
                .replace('{{userFullName}}', bundle.userFullName)
                .replace('{{providerTitle}}', bundle.providerTitle)
                .replace('{{providerFullName}}', bundle.providerFullName)
                .replace('{{providerType}}', bundle.providerType)
                .replace('{{time}}', bundle.appointmentDateTime ? moment(bundle.appointmentDateTime).format('LT') : '')
                .replace('{{date}}', bundle.appointmentDateTime ? moment(bundle.appointmentDateTime).format('LL') : '');
        }

        let notificationTemplatesRepository = repositoriesFactory.getNotificationTemplatesRepository(awsFactory.getDb());
        let userRepository = repositoriesFactory.getUserRepository(awsFactory.getDb());
        let userDetailsRepository = repositoriesFactory.getUserDetailsRepository(awsFactory.getDb());
        let notificationsRepository = repositoriesFactory.getNotificationsRepository(awsFactory.getDb());
        userRepository.findOneByEmail(userId, (err, user)=> {
            if (!err) {
                userDetailsRepository.findOneByEmail(userId, (err, userDetails)=> {
                    if (!err) {
                        notificationTemplatesRepository.getOne(this._notificationTemplateName, (err, notificationTemplate)=> {
                            if (!err) {

                                let instanceBudle = {
                                    userTitle: userDetails && userDetails.title ? userDetails.title : "",
                                    userFullName: user.name + ' ' + user.surname,
                                    providerTitle: event.payload.providerTitle,
                                    providerFullName: event.payload.providerFullName,
                                    providerType: event.payload.providerType,
                                    appointmentDateTime: event.payload.appointmentDateTime
                                };

                                let notification = {
                                    userId: userId,
                                    dateTime: new Date().getTime(),
                                    category: notificationTemplate.category,
                                    content: instantiateParameters(notificationTemplate.content, instanceBudle),
                                    summary: instantiateParameters(notificationTemplate.summary, instanceBudle),
                                    title: notificationTemplate.title,
                                    imageLink: notificationTemplate.imageLink ? notificationTemplate.imageLink : 'https://s3-eu-west-1.amazonaws.com/trichrome/public/default.png',
                                    read: false,
                                    type: notificationTemplate.templateName,
                                    defaultAction: 'openMessage'
                                };

                                if (notificationTemplate.content.includes('{{providerFullName}}') && !event.payload.providerId) {
                                    callback(new Error('The provider was not specified!'));
                                    return;
                                }

                                notificationsRepository.save(notification, (err)=> {
                                    if (!err) {
                                        let snsEndpointsRepository = repositoriesFactory.getSnsEndpointsRepository(awsFactory.getDb());

                                        snsEndpointsRepository.getList(userId, (err, snsEndpoints)=> {
                                            if(!snsEndpoints || snsEndpoints.length==0) {
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
                                                        callback(err, data);
                                                    }
                                                });
                                            });
                                        });
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