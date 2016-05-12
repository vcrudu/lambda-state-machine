/**
 * Created by victorcrudu on 09/05/2016.
 */

import chai from 'chai';
import sinon from 'sinon';
import path from 'path';
import ConfigManager from '../src/configManager';
import StateMachine from '../src/stateMachine';
import repositoriesFactory from '../src/repositoriesFactory'
import awsFactory from '../src/awsFactory';
import actionFactory from '../src/actions/actionFactory'
import StatesManager from '../src/statesManager';

describe('StateMachine',()=> {
    chai.should();
    var expect = chai.expect;
    var getDynamoDbStub = function(userState){
        var dynamoDb= awsFactory.getDb();
        sinon.stub(dynamoDb, "getItem", function(params, callback) {
            setTimeout(function () {
                if (userState) {
                    callback(null, {
                        Item: {
                            email: {S: 'test@test.com'},
                            name: {S: 'Test Testovici'},
                            userState: {S: userState}
                        }
                    });
                }
                else {
                    callback(null, {
                        Item: {
                            email: {S: 'test@test.com'},
                            name: {S: 'Test Testovici'}
                        }
                    });
                }

            }, 0);
        });

        sinon.stub(dynamoDb, "updateItem", function(params, callback){
            setTimeout(function(){
                callback(null, 'OK');
            }, 0);
        });
        return dynamoDb;
    };

    describe('StateMachine receiveEvent', () => {
        it('should call userRepository.FindOneByEmail', (done)=> {
            var filePath = path.resolve('.', './src/misc/patientStateMachine.json');
            var stateMachineConfig = ConfigManager.getLocalStateMachineConfig(filePath);
            stateMachineConfig.start.should.to.be.ok;

            let userRepository = repositoriesFactory.getUserRepository(getDynamoDbStub());

            userRepository.should.be.ok;
            done();


            var spyUserRepositoryFindOneByEmail = sinon.spy(userRepository, "findOneByEmail");
            var spyUserRepositoryUpdateStatus = sinon.spy(userRepository, "updateState");

            var statesManager = new StatesManager(stateMachineConfig, actionFactory);

            let stateMachine = new StateMachine(statesManager, userRepository, actionFactory);
            var event = {
                payload: {userId: 'test@test.com'}
            };
            stateMachine.receiveEvent(event, function () {
                spyUserRepositoryFindOneByEmail.calledOnce.should.ok;
                spyUserRepositoryUpdateStatus.calledOnce.should.ok;
                done();
            });
            
        });
    });
});