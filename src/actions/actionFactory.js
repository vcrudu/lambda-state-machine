/**
 * Created by victorcrudu on 09/05/2016.
 */
import Action from './action'
import ActionAppointmentBooked from './actionAppointmentBooked';
import awsFactory from '../awsFactory';

class ActionFactory{
    constructor(actions){
        this._actions = {};
        for (let i=0;i<actions.length;i++){
            this._actions[actions[i].getName()] = actions[i];
        }
    }
    getAction(name){
        return this._actions[name];
    }
}

export default new ActionFactory([
    new Action('ActionSendWelcomeNotification',awsFactory.getSnsClient()),
    new Action('ActionSendInformDevicesAvailable',awsFactory.getSnsClient()),
    new Action('ActionSendInformCanMakeAppointments',awsFactory.getSnsClient()),
    new Action('ActionSendInformProvideDetails',awsFactory.getSnsClient()),
    new ActionAppointmentBooked('ActionSendPatientAppointmentBookedNotification',awsFactory.getSnsClient()),
    new ActionAppointmentBooked('ActionSendProviderAppointmentBookedNotification',awsFactory.getSnsClient()),
    new Action('ActionSendDevicesOrderedNotification',awsFactory.getSnsClient()),
    new Action('ActionSendDevicesDispatchedNotification',awsFactory.getSnsClient()),
    new Action('ActionSendInstallDevicesNotification',awsFactory.getSnsClient()),
    new Action('ActionSendTakeMeasurementNotification',awsFactory.getSnsClient())
]);
