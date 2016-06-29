/**
 * Created by victorcrudu on 19/05/2016.
 */
import loggerProvider from '../logging';
const  TABLE_NAME        = 'UserDetails';

class UserDetailsRepository {
    constructor(dynamoDb){
        this._dynamoDb = dynamoDb;
    }

    findOneByEmail(email, callback) {

        var params = {
            Key: {email: {S: email}},
            TableName: TABLE_NAME,
            ReturnConsumedCapacity: 'TOTAL'
        };


        this._dynamoDb.getItem(params, function (err, data) {
            if (err) {
                loggerProvider.getLogger().error(err);
                callback(err, null);
                return;
            }
            loggerProvider.getLogger().debug("The " + TABLE_NAME + " has been found successfully.");
            if (data.Item) {
                let user = {
                    userId:data.Item.email.S,
                    title: data.Item.title?data.Item.title.S:"",
                    name:data.Item.name.S,
                    surname:data.Item.surname.S
                };
                callback(null, user);
            } else {
                callback(null, null);
            }
        });
    }
}

export default UserDetailsRepository;