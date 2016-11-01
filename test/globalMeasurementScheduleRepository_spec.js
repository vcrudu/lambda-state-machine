/**
 * Created by victorcrudu on 07/05/2016.
 */
import chai from 'chai';
import sinon from 'sinon';
import GlobalMeasurementScheduleRepository from '../src/repositories/globalMeasurementScheduleRepository';
import connectionOptions from './awsOptions';
import GlobalMeasurementScheduleDbMapper from '../src/repositories/globalMeasurementScheduleDbMapper';
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

describe('GlobalMeasurementScheduleRepository',()=> {
    chai.should();
    var expect = chai.expect;
    var child;
    before((done)=> {
        child = startDynamoDb(["--sharedDb"]);
        done();
    });
    describe('getOne', ()=> {
        it('should return globalMeasurementSchedule', (done)=> {
            let globalMeasurementScheduleRepository = new GlobalMeasurementScheduleRepository(dynamoDb);
            globalMeasurementScheduleRepository.createTable((err)=> {
                expect(err).to.be.null;

                let testGlobalMeasurementSchedule = {
                    "dayTimePoints": [
                        {
                            "reminders": [
                                -240,
                                -60
                            ],
                            "time": "12:00AM"
                        },
                        {
                            "reminders": [
                                -240,
                                -60
                            ],
                            "time": "10:00PM"
                        }
                    ],
                    "scheduleType": "bloodPressure"
                };

                globalMeasurementScheduleRepository.save(testGlobalMeasurementSchedule, (err)=> {
                    expect(err).to.be.null;
                    globalMeasurementScheduleRepository.getOne(testGlobalMeasurementSchedule.scheduleType, (err, responseGlobalMeasurementSchedule)=> {
                        expect(err).to.be.null;
                        console.log(util.inspect(responseGlobalMeasurementSchedule.dayTimePoints[0], 5));
                        expect(responseGlobalMeasurementSchedule.scheduleType).to.be.equal(testGlobalMeasurementSchedule.scheduleType);
                        responseGlobalMeasurementSchedule.dayTimePoints.length.should.equal(testGlobalMeasurementSchedule.dayTimePoints.length);
                        responseGlobalMeasurementSchedule.dayTimePoints[0].reminders.length.should.equal(testGlobalMeasurementSchedule.dayTimePoints[0].reminders.length);
                        done();
                    });
                });
            });
        });
    });

    after((done)=> {
        let globalMeasurementScheduleRepository = new GlobalMeasurementScheduleRepository(dynamoDb);
        globalMeasurementScheduleRepository.deleteTable((err)=> {
            expect(err).to.be.null;
            child.kill();
            done();
        });
    });
});