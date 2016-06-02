/**
 * Created by victorcrudu on 10/05/2016.
 */
 
import Action from './action';

class ActionSendProviderAppointmentBookedNotification extends Action {
    constructor(name, notificationTemplateName, snsClient) {
        super(name, notificationTemplateName, snsClient);
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
        super.execAction(event.payload.providerId, event, callback);
    }
}

export default ActionSendProviderAppointmentBookedNotification;