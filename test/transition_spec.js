/**
 * Created by victorcrudu on 27/05/2016.
 */
import Transition from '../src/transition';
import chai from 'chai';
import sinon from 'sinon';
import actionFactory from '../src/actions/actionFactory';

describe("Transition", ()=> {
    let expect = chai.expect;
    let getActionStub;
    describe("Whein create instance with no actions and call run", ()=> {
        it("should not do anything", (done)=> {

            let transitionConfig = {
                trigger: "OnTestEvent",
                target: "TestTarget"
            };

            let event = {};

            let user = {userId: "test@test.com"};

            let transition = new Transition(transitionConfig, actionFactory);
            transition.runTransitionActions(user, event, (err)=> {
                expect(err).to.not.be.ok;
                done();
            });
        });
    });

    describe("Whein create instance with  actions and call run", ()=> {
        it("should all execute actions", (done)=> {

            let transitionConfig = {
                trigger: "OnTestEvent",
                target: "TestTarget",
                actions: [{
                    name: "action1"
                },
                    {
                        name: "action2"
                    }]
            };

            let event = {};

            let user = {userId: "test@test.com"};
            getActionStub = sinon.stub(actionFactory, 'getAction');
            let action1DoStub = sinon.stub();
            action1DoStub.yields(null);
            let action2DoStub = sinon.stub();
            action2DoStub.yields(null);
            getActionStub.withArgs('action1').returns({do: action1DoStub});
            getActionStub.withArgs('action2').returns({do: action2DoStub});

            let transition = new Transition(transitionConfig, actionFactory);
            transition.runTransitionActions(user, event, (err)=> {
                expect(err).to.not.be.ok;
                expect(action1DoStub.calledOnce).to.be.true;
                expect(action2DoStub.calledOnce).to.be.true;
                done();
            });
        });
    });

    describe("Whein create instance with invalid actions and call run", ()=> {
        it("should do nothing", (done)=> {

            let transitionConfig = {
                trigger: "OnTestEvent",
                target: "TestTarget",
                actions: [{
                    name: "action1"
                },
                    {
                        name: "action2"
                    }]
            };

            let event = {};

            let user = {userId: "test@test.com"};
            getActionStub = sinon.stub(actionFactory, 'getAction');

            let transition = new Transition(transitionConfig, actionFactory);
            transition.runTransitionActions(user, event, (err)=> {
                expect(err).to.not.be.ok;
                done();
            });
        });
    });

    afterEach(()=>{
        if(  getActionStub )
        getActionStub.restore();
    });
});