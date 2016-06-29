/**
 * Created by victorcrudu on 20/05/2016.
 */

import chai from 'chai';
import sinon from 'sinon';
import Action from '../src/actions/action';
import awsFactory from '../src/awsFactory';
import repositoriesFactory from '../src/repositories/repositoriesFactory';
import NotificationTemplatesRepository from '../src/repositories/notificationTemplatesRepository';
import NotificationsRepository from '../src/repositories/notificationsRepository';
import UserRepository from '../src/repositories/userRepository';
import UserDetailsRepository from '../src/repositories/userDetailsRepository';
import SnsEndpointsRepository from '../src/repositories/snsEndpointsRepository';
import ActionSendProviderAppointmentBookedNotification from '../src/actions/actionSendProviderAppointmentBookedNotification';


describe('Action class',()=> {
    var expect = chai.expect;
    let getSnsClientPublishStub;
    let notificationTemplatesRepository;
    let userRepository;
    let userDetailsRepository;
    let snsEndpointsRepository;
    let notificationsRepository;

    let notificationTemplatesRepositoryGetOneStub;
    let fakeNotificationTemplate;
    let userRepositoryFindOneByEmailStub;
    let fakeUser;
    let userDetailsRepositoryFindOneByEmailStub;
    let fakeUserDetails;
    let notificationsRepositorySaveStub;
    let snsEndpointsRepositoryGetListStub;
    let fakeSnsEndpoints;
    let awsFactoryGetSnsClientStub;

    beforeEach(()=> {

        notificationTemplatesRepository = new NotificationTemplatesRepository(awsFactory.getDb);
        userRepository = new UserRepository(awsFactory.getDb());
        userDetailsRepository = new UserDetailsRepository(awsFactory.getDb());
        snsEndpointsRepository = new SnsEndpointsRepository(awsFactory.getDb());
        notificationsRepository = new NotificationsRepository(awsFactory.getDb());

        getSnsClientPublishStub = sinon.stub();
        getSnsClientPublishStub.yields(null, "OK");
        awsFactoryGetSnsClientStub = sinon.stub(awsFactory, 'getSnsClient', function () {
            return {
                publish: getSnsClientPublishStub
            };
        });

        /* ------ Stub notificationTemplatesRepository ----*/
        fakeNotificationTemplate = {
            templateName: "templateName",
            title: "title",
            summary: "summary",
            content: "content",
            category:"category"
        };

        notificationTemplatesRepositoryGetOneStub = sinon.stub();
        notificationTemplatesRepositoryGetOneStub.yields(null, fakeNotificationTemplate);
        sinon.stub(notificationTemplatesRepository, 'getOne', notificationTemplatesRepositoryGetOneStub);


        /* ------ Stub userRepository ----*/
        fakeUser = {
            name: "username",
            surname: "surname"
        };

        userRepositoryFindOneByEmailStub = sinon.stub();
        userRepositoryFindOneByEmailStub.yields(null, fakeUser);
        sinon.stub(userRepository, 'findOneByEmail', userRepositoryFindOneByEmailStub);

        /* ------ Stub userDetailsRepository ----*/
        fakeUserDetails = {
            title: "Mr"
        };

        userDetailsRepositoryFindOneByEmailStub = sinon.stub();
        userDetailsRepositoryFindOneByEmailStub.yields(null, fakeUserDetails);
        sinon.stub(userDetailsRepository, 'findOneByEmail', userDetailsRepositoryFindOneByEmailStub);

        /* ------ Stub notificationsRepository ----*/
        fakeUserDetails = {
            title: "Mr"
        };

        notificationsRepositorySaveStub = sinon.stub();
        notificationsRepositorySaveStub.yields(null);
        sinon.stub(notificationsRepository, 'save', notificationsRepositorySaveStub);

        /* ------ Stub snsEndpointsRepository ----*/
        fakeSnsEndpoints = [{
            endpointArn: "testEndpointArn"
        }];

        snsEndpointsRepositoryGetListStub = sinon.stub();
        snsEndpointsRepositoryGetListStub.yields(null, fakeSnsEndpoints);
        sinon.stub(snsEndpointsRepository, 'getList', snsEndpointsRepositoryGetListStub);

        sinon.stub(repositoriesFactory, 'getUserRepository', sinon.stub().returns(userRepository));
        sinon.stub(repositoriesFactory, 'getUserDetailsRepository', sinon.stub().returns(userDetailsRepository));
        sinon.stub(repositoriesFactory, 'getNotificationsRepository', sinon.stub().returns(notificationsRepository));
        sinon.stub(repositoriesFactory, 'getNotificationTemplatesRepository', sinon.stub().returns(notificationTemplatesRepository));
        sinon.stub(repositoriesFactory, 'getSnsEndpointsRepository', sinon.stub().returns(snsEndpointsRepository));

    });

    afterEach(()=>{
        awsFactory.getSnsClient.restore();
        repositoriesFactory.getUserRepository.restore();
        repositoriesFactory.getUserDetailsRepository.restore();
        repositoriesFactory.getNotificationsRepository.restore();
        repositoriesFactory.getNotificationTemplatesRepository.restore();
        repositoriesFactory.getSnsEndpointsRepository.restore();
    });

    describe('Simple action', ()=> {
        it('should instantiate message with user details, save into database and send message', (done)=> {

            //console.log(util.inspect(awsFactory.getDb().getItem, true, 2));
            let testedAction = new Action('ActionSendWelcomeNotification', 'welcomeMessage', awsFactory.getSnsClient());

            let event = {
                payload: {userId:'vcrudu@hotmail.com'}
            };

            testedAction.do(event, (err, data)=> {
                expect(err).to.be.null;
                expect(data).to.be.ok;
                expect(getSnsClientPublishStub.calledOnce).to.be.true;
                done();
            });
            //done();
        });

    });

    describe('Appointment action', ()=> {
        it('should instantiate message with user details, save into database and send message', (done)=> {

            let testedAction = new ActionSendProviderAppointmentBookedNotification('ActionSendProviderAppointmentBookedNotification', 'providerAppointmentBooked', awsFactory.getSnsClient());

            let event = {
                "name": "OnAppointmentBooking",
                "payload": {
                    "userId": "vcrudu1@hotmail.com",
                    "providerId": "who@hotmail.com",
                    "providerTitle": "Dr.",
                    "providerFullName": "Martin Who",
                    "providerType": "Medicine",
                    "appointmentDateTime": 1467207900000
                }
            };

            testedAction.do(event, (err, data)=> {
                expect(err).to.be.null;
                expect(data).to.be.ok;
                expect(getSnsClientPublishStub.calledOnce).to.be.true;
                done();
            });
        });
    });


});