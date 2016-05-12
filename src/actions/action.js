/**
 * Created by victorcrudu on 10/05/2016.
 */

class Action{
    constructor(name, snsClient){
        this._name = name;
        this._snsClient = snsClient;
    }

    getName(){
        return this._name;
    }

    getSnsClient(){
        return this._snsClient;
    }

    setName(name){
        this._name = name;
    }

    do(userId, callback){
        var params = {
            Message: JSON.stringify({
                userId: userId,
                action: this._name
            }), /* required */
            MessageAttributes: {
                userId: {
                    DataType:'String',
                    StringValue: userId /* required */
                }
            },
            TargetArn: 'arn:aws:sns:eu-west-1:160466482332:trichrome-notification'
        };
        this._snsClient.publish(params, function(err, data) {
            callback(err, data);
        });
    }
}

export default Action;