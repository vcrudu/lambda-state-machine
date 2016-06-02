/**
 * Created by victorcrudu on 10/05/2016.
 */

import http from 'http';
import moment from 'moment';
import Action from './action';
import logging from '../logging';

class ActionScheduleOneTimeEvent extends Action {
    constructor(name, eventName, jobDateTime, offset) {
        super(name, null, null);
        this._name = name;
        this._eventName = eventName;
        this._offset = offset;
        this._jobDateTime = jobDateTime;
    }

    set jobDateTime(value) {
        this._jobDateTime = value
    }

    get jobDateTime() {
        return this._jobDateTime
    }

    do(event, callback) {

        let userId = event.payload.userId;
        var reqOptions = {
            hostname: 'hcm-scheduler.eu-west-1.elasticbeanstalk.com',
            port: 80,
            path: "/jobs",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InZjcnVkdUBob3RtYWlsLmNvbSIsImlhdCI6MTQzODU0Mzc5OH0.hEJl-vGudvpQDCWgiPkdKKEtj1kOl59b59wveW5w1X4'
            }
        };

        if (!this._jobDateTime) {
            this._jobDateTime = moment().valueOf();
        }

        var jobDateTime = moment(this._jobDateTime).add(this._offset, 'seconds');

        var post_data = JSON.stringify(
            {
                "dateTime": jobDateTime.valueOf(),
                "jobName": "sendStateMachineEvent",
                "payload": {
                    "userId": userId,
                    "eventName": this._eventName,
                    "providerId": event.payload.providerId,
                    "providerTitle": event.payload.providerTitle,
                    "providerFullName": event.payload.providerFullName,
                    "providerType": event.payload.providerType,
                    "appointmentDateTime": event.payload.appointmentDateTime
                }
            });

        var req = http.request(reqOptions, function (res) {

            res.setEncoding('utf8');

            var data = "";

            res.on('data', function (d) {
                data = data + d.toString('utf8');
            });

            res.on('end', function () {
                callback(null);
            });

            req.on('error', function (e) {
                callback(e);
            });

        });

        req.write(post_data);
        req.end();
    }
}

export default ActionScheduleOneTimeEvent;