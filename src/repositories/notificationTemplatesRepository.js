/**
 * Created by Victor on 26/06/2015.
 */

    import loggerProvider  from '../logging';
    import awsFactory from '../awsFactory';
    const TABLE_NAME = 'NotificationTemplate';

    var getDb = function(){

        return awsFactory.getDb();

    };

   class NotificationTemplateRepository {

       constructor(dynamoDb) {
           this._dynamoDb = dynamoDb;
       }

       getOne(templateName, callback) {
           var params = {
               Key: {templateName: {S: templateName}},
               TableName: TABLE_NAME,
               ReturnConsumedCapacity: 'TOTAL'
           };

           this._dynamoDb.getItem(params, function (err, data) {
               if (err) {
                   loggerProvider.getLogger().error(err);
                   callback(err, null);
                   return;
               }
               loggerProvider.getLogger().debug("The notification template has been found successfully.");
               if (data.Item) {
                   var notificationTemplate = {
                       templateName: data.Item.templateName.S,
                       title: data.Item.title.S,
                       summary: data.Item.summary.S,
                       content: data.Item.content.S,
                       category:data.Item.category.S
                   };
                   callback(null, notificationTemplate);
               } else {
                   callback(null, null);
               }
           });
       }
   }

export default NotificationTemplateRepository;
