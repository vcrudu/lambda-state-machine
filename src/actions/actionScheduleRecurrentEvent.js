/**
 * Created by victorcrudu on 10/05/2016.
 */

import http from 'http';
import moment from 'moment';
import Action from './action';

class ActionScheduleRecurrentEvent extends Action {
    constructor(name,eventName, jobDateTime, period) {
        super(name, null, null);
        this._name = name;
        this._eventName = eventName;
        this._period = period;
        this._jobDateTime = jobDateTime;
    }

    set jobDateTime  (value)  { this._jobDateTime = value            }
    get jobDateTime  ()       { return this._jobDateTime             }

    do(userId, event, callback) {

        var reqOptions = {
            hostname: 'localhost', //'hcm-scheduler.eu-west-1.elasticbeanstalk.com',
            port: 8081,
            path: "/jobs",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InZjcnVkdUBob3RtYWlsLmNvbSIsImlhdCI6MTQzODU0Mzc5OH0.hEJl-vGudvpQDCWgiPkdKKEtj1kOl59b59wveW5w1X4'
            }
        };

        if(!this._jobDateTime) {
            callback(new Error('Job datetime is missing!'));
            return;
        }

        var jobDateTime = moment(this._jobDateTime);

        var post_data = JSON.stringify({
            "dateTime": jobDateTime.valueOf(),
            "recurrent": true,
            "period": this._period,
            "jobName": "sendStateMachineEvent",
            "payload": {"userId": userId, "eventName": this._eventName}
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

export default ActionScheduleRecurrentEvent;