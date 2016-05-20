/**
 * Created by victorcrudu on 10/05/2016.
 */
 
import awsFactory from '../awsFactory';
import repositoriesFactory from '../repositories/repositoriesFactory';

class Action {
    constructor(name, notificationTemplateName, snsClient) {
        this._name = name;
        this._notificationTemplateName = notificationTemplateName;
        this._snsClient = snsClient;
        this._appEndpoint = 'arn:aws:sns:eu-west-1:160466482332:app/GCM/trichrome_health_monitor';
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

export default Action;