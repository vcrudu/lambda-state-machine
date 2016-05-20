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
            var dynamoDb= awsFactory.getDb();
            sinon.stub(dynamoDb, "getItem", function(params, callback){
                setTimeout(function(){
                    callback(null, {Item:{email:{S:'test@test.com'},name:{S:'Test Testovici'},userState:{S:'test'}}});
                }, 0);
            });
            let userRepository = new UserRepository(dynamoDb);

            userRepository.findOneByEmail('test@test.com',(err, user)=>{
                user.email.should.equal('test@test.com');
                user.name.should.equal('Test Testovici');
                user.userState.should.equal('test');
                done();
            });
        });
    });

    describe('updateState', ()=> {
        it('should update user status', (done)=> {
            let userRepository = new UserRepository(awsFactory.getDb());
            userRepository.updateState('vcrudu@hotmail.com', "test", (err, user)=>{
                expect(err).to.be.null;
                done();
            });
        });
    });
});