/**
 * Created by victorcrudu on 06/05/2016.
 */
import chai from 'chai';
import ConfigManager from '../src/configManager';
import awsFactory from '../src/awsFactory';

describe('config',()=> {
    chai.should();
    describe('getStateMachineConfig', ()=> {
        it('should return state machine config', (done)=> {
            let s3Client = awsFactory.getS3Client();
            ConfigManager.getStateMachineConfig(s3Client, (err, stateMachineConfig)=>{
                stateMachineConfig.start.should.ok;
                stateMachineConfig.start.name.should.ok;
                stateMachineConfig.start.transitions.should.ok;
                stateMachineConfig.start.actions.should.ok;
                done();
            });
        });
    });
});