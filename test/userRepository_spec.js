/**
 * Created by victorcrudu on 07/05/2016.
 */
import chai from 'chai';
import sinon from 'sinon';
import UserRepository from '../src/repositories/userRepository';
import awsFactory from '../src/awsFactory';

describe('userRepository',()=> {
    chai.should();
    var expect = chai.expect;
    describe('findOneByEmail', ()=> {
        it('should return user', (done)=> {
            var dynamoDb = awsFactory.getDb();
            sinon.stub(dynamoDb, "getItem", function (params, callback) {
                setTimeout(function () {
                    callback(null, {
                        Item: {
                            email: {S: 'test@test.com'},
                            name: {S: 'Test'},
                            surname: {S: 'Testovici'},
                            userState: {S: 'test'}
                        }
                    });
                }, 0);
            });
            let userRepository = new UserRepository(dynamoDb);

            userRepository.findOneByEmail('test@test.com', (err, user)=> {
                user.email.should.equal('test@test.com');
                user.name.should.equal('Test');
                user.surname.should.equal('Testovici');
                user.userState.should.equal('test');
                done();
            });
        });
    });

    describe('updateState', ()=> {
        it('should update user status', (done)=> {

            let userState = "test";
            let TABLE_NAME = "User";
            let userId = 'vcrudu@hotmail.com';

            var params = {
                Key: {email: {S: userId}},
                TableName: TABLE_NAME,
                ExpressionAttributeValues: {
                    ":userState": {"S": userState},
                },
                ReturnConsumedCapacity: 'TOTAL',
                UpdateExpression: 'SET userState=:userState'
            };

            var dynamoDb = awsFactory.getDb();
            var updateItemStub = sinon.stub(dynamoDb, "updateItem");
            updateItemStub.yields(null, "OK");

            let userRepository = new UserRepository(dynamoDb);
            userRepository.updateState(userId, userState, (err, user)=> {
                expect(err).to.be.null;
                expect(updateItemStub.calledWith(params)).to.be.true;
                done();
            });
        });
    });
});