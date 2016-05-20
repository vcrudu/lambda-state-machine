/**
 * Created by victorcrudu on 10/05/2016.
 */
 
import awsFactory from '../awsFactory';
import repositoriesFactory from '../repositories/repositoriesFactory';
import Action from './action';

class ActionAppointmentBooked extends Action{
    constructor(name, notificationTemplateName, snsClient) {
        super(name, notificationTemplateName, snsClient);
    }

    //{{userTitle}} {{userFullName}} {{providerTitle}} {{providerFullName}} {{userTitle}} {{userFullName}} {{time}} on {{date}}
    //{{providerType}}

    do(userId, event, callback) {

        let notificationTemplatesRepository = repositoriesFactory.getNotificationTemplatesRepository(awsFactory.getDb());
        let userDetailsRepository = repositoriesFactory.getUserDetailsRepository(awsFactory.getDb);
        userDetailsRepository.findOneByEmail(userId, (err, user)=> {
            if (!err) {
                notificationTemplatesRepository.getOne(this._notificationTemplateName, (err, notificationTemplate)=> {
                    let notification = {
                        userId: userId,
                        dateTime: new Date().getTime(),
                        category: notificationTemplate.category,
                        content: notificationTemplate.content.replace('{{userTitle}}',user.title).replace('{{userFullName}}',user.name + ' ' + user.surname),
                        summary: notificationTemplate.summary,
                        title: notificationTemplate.title,
                        imageLink: notificationTemplate.imageLink ? notificationTemplate.imageLink : 'https://s3-eu-west-1.amazonaws.com/trichrome/public/default.png',
                        read: false,
                        type: notificationTemplate.templateName
                    };

                    var params = {
                        Message: JSON.stringify({
                            userId: userId,
                            action: this._name,
                            notification:notification
                        }), /* required */
                        MessageAttributes: {
                            userId: {
                                DataType: 'String',
                                StringValue: userId /* required */
                            }
                        },
                        TargetArn: this._appEndpoint
                    };
                    this._snsClient.publish(params, function (err, data) {
                        callback(err, data);
                    });
                });
            }
        });
    }
}

export default ActionAppointmentBooked;