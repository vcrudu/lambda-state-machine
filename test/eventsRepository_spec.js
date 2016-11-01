/**
 * Created by victorcrudu on 07/05/2016.
 */
import chai from 'chai';
import sinon from 'sinon';
import EventsRepository from '../src/repositories/eventsRepository';
import connectionOptions from './awsOptions';
import EventDbMapper from '../src/repositories/eventDbMapper';
import util from 'util';
import AWS from 'aws-sdk';
import child_process from  'child_process';



const dynamoDb = new AWS.DynamoDB(connectionOptions);
const startDynamoDb = (args, opts) => {
    args = args || [];
    opts = opts || {};
    const child = child_process.spawn(
        "java",
        [
            `-Djava.library.path=${__dirname}/dblocal/DynamoDBLocal_lib`,
            `-jar`,
            `${__dirname}/dblocal/DynamoDBLocal.jar`,
            `--port`,
            `8000`
        ].concat(args),
        Object.assign({}, {env: process.env}, opts)
    );
    return child;
};

describe('eventsRepository',()=> {
    chai.should();
    var expect = chai.expect;
    var child;
    before((done)=> {
        child = startDynamoDb(["--sharedDb"]);
        done();
    });

    describe('findOneByEmail', ()=> {
        it('should return user', (done)=> {
            let eventsRepository = new EventsRepository(dynamoDb);
            eventsRepository.createTable((err)=> {
                expect(err).to.be.null;

                let testEvent = {
                    userId: "test@test.com",
                    measurementType: "bloodPressure",
                    measurementDateTime: new Date(),
                    bloodPressure: {diastolic: 80, systolic: 120}
                };

                eventsRepository.save(testEvent, (err)=> {
                    expect(err).to.be.null;
                    eventsRepository.getLastOne(testEvent.userId, testEvent.measurementType, (err, responseEvent)=> {
                        expect(err).to.be.null;

                        responseEvent.userId.should.equal(testEvent.userId);
                        responseEvent.measurementType.should.equal(testEvent.measurementType);
                        responseEvent.measurementDateTime.getTime().should.equal(testEvent.measurementDateTime.getTime());
                        responseEvent.bloodPressure.diastolic.should.equal(testEvent.bloodPressure.diastolic);
                        responseEvent.bloodPressure.systolic.should.equal(testEvent.bloodPressure.systolic);
                        done();
                    });
                });
            });
        });
    });

    after((done)=> {
        let eventsRepository = new EventsRepository(dynamoDb);
        eventsRepository.deleteTable((err)=> {
            expect(err).to.be.null;
            child.kill();
            done();
        });
    });
});