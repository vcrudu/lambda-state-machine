/**
 * Created by victorcrudu on 06/05/2016.
 */

import StatesManager from './statesManager'
import fs from 'fs';

class ConfigManager {
    static getStateMachineConfig(s3Client, callback) {

        let s3params = {
            Bucket: 'trichrome',
            Key: 'private/config/patientStateMachine.json'
        };

        s3Client.getObject(s3params, function (err, data) {

            let s3Content = data.Body.toString();
            let stateMachine = JSON.parse(s3Content);

            callback(new StatesManager(stateMachine));

        });
    }

    static getLocalStateMachineConfig(filePath) {
       var stateMachineConfigString =  fs.readFileSync(filePath, {
           encoding:'utf-8'
       });

        return JSON.parse(stateMachineConfigString);
    }
}

export default ConfigManager;