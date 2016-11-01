/**
 * Created by victorcrudu on 06/05/2016.
 */

import fs from 'fs';
import logging from './logging';

class ConfigManager {
    static getStateMachineConfig(s3Client, callback) {

        let s3params = {
            Bucket: 'trichrome',
            Key: 'private/config/patientStateMachine.group.json'
        };

        s3Client.getObject(s3params, function (err, data) {

            if (err) {
                logging.getLogger().error(err);
                callback(err);
            } else {

                let s3Content = data.Body.toString();
                let stateMachine = JSON.parse(s3Content);

                callback(null, stateMachine);
            }
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