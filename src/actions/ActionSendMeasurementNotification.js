/**
 * Created by victorcrudu on 10/05/2016.
 */

import awsFactory from '../awsFactory';
import Action from './action';
import moment from 'moment';
import repositoriesFactory from '../repositories/repositoriesFactory';
import util from 'util';

class ActionSendMeasurementNotification extends Action {
    constructor(snsClient) {
        super('ActionSendMeasurementNotification', 'patientMeasure', snsClient);
    }
    
    _getMeasurementValueString(measurementType, value){

        switch (measurementType){
            case 'heartRate':
                return `Heart rate - ${value} BPM`;
            case 'bloodPressure':
                return `Blood Pressure - ${value.systolic}/${value.diastolic} mmHg`;
            case 'bloodGlucose':
                return `Blood Glucose - ${value} mg/dL`;
            case 'bloodOxygen':
                return `Blood Oxygen  - ${value} %`;
            case 'respiratoryRate':
                return `Respiratory Rate - ${value} breaths per minute`;
            case 'temperature':
                return `Temperature - ${value} °C`;
        }
    }

    _instantiateParameters(parametrizedString, bundle) {
        return parametrizedString
            .replace('{{userTitle}}', bundle.userTitle)
            .replace('{{userFullName}}', bundle.userFullName)
            .replace('{{measurementType}}', bundle.measurementType)
            .replace('{{measurementValue}}', this._getMeasurementValueString(bundle.measurementType, bundle.value))
            .replace('{{dateTime}}', moment(bundle.utcDateTime).format("MMM Do YYYY, h:mm:ss a"));
    }

    buildTemplate(userDetails, user, event, notificationTemplate) {
        let instanceBundle = {
            userTitle: userDetails && userDetails.title ? userDetails.title : "",
            userFullName: user.name + ' ' + user.surname,
            value: event.payload.measurementDetails.value,
            measurementType: event.payload.measurementDetails.measurementType,
            utcDateTime:event.payload.measurementDetails.utcDateTime
        };

        let notification = {
            userId: user.email,
            dateTime: new Date().getTime(),
            category: notificationTemplate.category,
            content: this._instantiateParameters(notificationTemplate.content, instanceBundle),
            summary: this._instantiateParameters(notificationTemplate.summary, instanceBundle),
            title: notificationTemplate.title,
            imageLink: notificationTemplate.imageLink ? notificationTemplate.imageLink : 'https://s3-eu-west-1.amazonaws.com/trichrome/public/default.png',
            read: false,
            type: notificationTemplate.templateName,
            defaultAction: 'openMessage'
        };
        return notification;
    }

    execAction(userId, event, callback) {
        let notificationTemplatesRepository = repositoriesFactory.getNotificationTemplatesRepository(awsFactory.getDb());
        let userRepository = repositoriesFactory.getUserRepository(awsFactory.getDb());
        let userDetailsRepository = repositoriesFactory.getUserDetailsRepository(awsFactory.getDb());
        userRepository.findOneByEmail(userId, (err, user)=> {
            if (!err) {
                userDetailsRepository.findOneByEmail(userId, (err, userDetails)=> {
                    if (!err) {
                        notificationTemplatesRepository.getOne(super.getNotificationTemplateName(), (err, notificationTemplate)=> {
                            if (!err) {
                                let notification = this.buildTemplate(userDetails, user, event, notificationTemplate);
                                super.SendNotification(notification, userId, callback);
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

        if (!event.payload.measurementDetails
            || !event.payload.measurementDetails.value
            || !event.payload.measurementDetails.measurementType
            || !event.payload.measurementDetails.utcDateTime) {
            callback(new Error('The measurement details were not specified!'));
            return;
        }
        this.execAction(event.payload.userId, event, callback);
    }
}

export default ActionSendMeasurementNotification;