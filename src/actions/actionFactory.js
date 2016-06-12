/**
 * Created by victorcrudu on 09/05/2016.
 */
import Action from './action'
import ActionScheduleOneTimeEvent from './actionScheduleOneTimeEvent';
import awsFactory from '../awsFactory';
import ActionSendProviderAppointmentBookedNotification from './actionSendProviderAppointmentBookedNotification';
import ActionSendPatientAppointmentBookedNotification from './actionSendPatientAppointmentBookedNotification';
import ActionSendPatientAlarmNotification from './actionSendPatientAlarmNotification';
import ActionSendMeasurementNotification from './actionSendMeasurementNotification';



class ActionFactory {
    constructor(actions) {
        this._actions = {};
        for (let i = 0; i < actions.length; i++) {
            this._actions[actions[i].getName()] = actions[i];
        }
    }

    getAction(name, event, period, offset) {
        switch (name) {
            case 'ActionScheduleOnOneMinuteRemained':
            {
                return new ActionScheduleOneTimeEvent('ActionScheduleOnOneMinuteRemained', 'OnOneMinuteRemained', event.payload.appointmentDateTime, offset);
            }
            case 'ActionScheduleAdviseTakeMeasurement':
            {
                return new ActionScheduleOneTimeEvent('ActionScheduleAdviseTakeMeasurement', 'OnMeasurementExpected', null, offset);
            }
            case 'ActionSendProviderAppointmentBookedNotification':
            {
                return new ActionSendProviderAppointmentBookedNotification('ActionSendProviderAppointmentBookedNotification', 'providerAppointmentBooked', awsFactory.getSnsClient());
            }
            case 'ActionSendPatientAppointmentBookedNotification':
            {
                return new ActionSendPatientAppointmentBookedNotification('ActionSendPatientAppointmentBookedNotification', 'patientAppointmentBooked', awsFactory.getSnsClient());
            }
            case 'ActionSendProviderOneMinuteRemainedNotification':
            {
                return new ActionSendProviderAppointmentBookedNotification('ActionSendProviderOneMinuteRemainedNotification', 'providerOneMinuteRemained', awsFactory.getSnsClient());
            }
            case 'ActionSendPatientOneMinuteRemainedNotification':
            {
                return new ActionSendPatientAppointmentBookedNotification('ActionSendPatientOneMinuteRemainedNotification', 'patientOneMinuteRemained', awsFactory.getSnsClient());
            }
            case 'ActionSendPatientAlarmNotification':
            {
                return new ActionSendPatientAlarmNotification(awsFactory.getSnsClient());
            }
            case 'ActionSendMeasurementNotification':
            {
                return new ActionSendMeasurementNotification(awsFactory.getSnsClient());
            }
            default:
                return this._actions[name];
        }
    }
}

export default new ActionFactory([
    new Action('ActionSendWelcomeNotification','welcomeMessage', awsFactory.getSnsClient()),
    new Action('ActionSendInformDevicesAvailable','devicesAvailable', awsFactory.getSnsClient()),
    new Action('ActionSendInformCanMakeAppointments','canMakeAppointment' ,awsFactory.getSnsClient()),
    new Action('ActionSendInformProvideDetails','provideDetails', awsFactory.getSnsClient()),
    new Action('ActionSendDevicesOrderedNotification','devicesOrdered', awsFactory.getSnsClient()),
    new Action('ActionSendDevicesDispatchedNotification','devicesDispatched', awsFactory.getSnsClient()),
    new Action('ActionSendInstallDevicesNotification','installDevices',awsFactory.getSnsClient()),
    new Action('ActionSendTakeMeasurementNotification','takeMeasurement', awsFactory.getSnsClient())

]);
