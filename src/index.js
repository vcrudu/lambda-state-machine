import ConfigManager from './configManager';
import StateMachine from './stateMachine';
import repositoriesFactory from './repositories/repositoriesFactory'
import awsFactory from './awsFactory';
import actionFactory from './actions/actionFactory'
import StatesManager from './statesManager';
import loggerProvider from './logging';
import util from 'util';

export let main = (event, context, callback) => {

    ConfigManager.getStateMachineConfig(awsFactory.getS3Client(), (err, stateMachineConfig)=> {
        if (!err) {
            try {


                console.log('Received event: ', util.inspect(event, true, 3));

                let statesManager = new StatesManager(stateMachineConfig, actionFactory);
                let stateMachine = new StateMachine(statesManager, repositoriesFactory.getUserRepository(awsFactory.getDb()), actionFactory);

                if (stateMachine && statesManager) {
                    loggerProvider.getLogger().info('hcm.patient.lambda has initialized successfully.');
                }

                let eventMessage = event.Records[0].Sns.Message;
                loggerProvider.getLogger().info('hcm.patient.lambda has received the event ' + eventMessage);


                let eventObject = JSON.parse(eventMessage);
                stateMachine.receiveEvent(eventObject, (err, data)=> {
                    if (err) {
                        loggerProvider.getLogger().error(err);
                    } else{
                        loggerProvider.getLogger().info('hcm.patient.lambda has handled the event ' + eventMessage + ' without errors.');
                    }
                    callback(err, data);
                });

            } catch (err) {
                loggerProvider.getLogger().error(err);
                callback(err, null);
            }
        } else {
            loggerProvider.getLogger().error(err);
            callback(err, null);
        }
    });
};