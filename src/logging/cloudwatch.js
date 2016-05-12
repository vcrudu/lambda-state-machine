/**
 * Created by Victor on 28/11/2015.
 */

var util = require('util');
var Writable = require('stream').Writable;
var AWS = require('aws-sdk');
var bunyan = require('bunyan');

module.exports = createCloudWatchStream;

var localLogger = bunyan.createLogger({
    name: 'hcm.registration.local',
    streams: [
        {
            level: 'trace',
            type: 'rotating-file',
            path: './log/hcm.local.log',
            period: '1d',   // daily rotation
            count: 3        // keep 3 back copies
        }]
});

function createCloudWatchStream(opts) {
    return new CloudWatchStream(opts);
}

util.inherits(CloudWatchStream, Writable);
function CloudWatchStream(opts) {
    Writable.call(this, {objectMode: true});
    this.logGroupName = opts.logGroupName;
    this.logStreamName = opts.logStreamName;
    this.writeInterval = opts.writeInterval || 0;
    AWS.config.update({region: opts.region});

    this.cloudwatch = new AWS.CloudWatchLogs({accessKeyId:opts.accessKeyId,
        secretAccessKey:opts.secretAccessKey});
    this.queuedLogs = [];
    this.sequenceToken = null;
    this.writeQueued = false;
}

CloudWatchStream.prototype._write = function (record, _enc, cb) {
    this.queuedLogs.push(record);
    if (!this.writeQueued) {
        this.writeQueued = true;
        setTimeout(this._writeLogs.bind(this), this.writeInterval);
    }
    cb();
}

CloudWatchStream.prototype._writeLogs = function () {
    if (this.sequenceToken === null) {
        return this._getSequenceToken(this._writeLogs.bind(this));
    }
    var log = {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        sequenceToken: this.sequenceToken,
        logEvents: this.queuedLogs.map(createCWLog)
    };
    this.queuedLogs = [];
    var obj = this;
    try {
        this.cloudwatch.putLogEvents(log, function (err, res) {
            if (err) {
                return obj._error(err);
            }
            obj.sequenceToken = res.nextSequenceToken;
            if (obj.queuedLogs.length) {
                return obj._writeLogs();
            }
            obj.writeQueued = false;
        });
    } catch (err) {
        localLogger.error(err);
    }
}

CloudWatchStream.prototype._getSequenceToken = function (done) {
    var params = {
        logGroupName: this.logGroupName,
        logStreamNamePrefix: this.logStreamName
    };
    var obj = this;
    try {
        this.cloudwatch.describeLogStreams(params, function (err, data) {
            if (err) {
                if (err.name === 'ResourceNotFoundException') {
                    createLogGroupAndStream(obj.cloudwatch, obj.logGroupName, obj.logStreamName, createStreamCb);
                    return;
                }
                return obj._error(err);
            }
            if (data.logStreams.length == 0) {
                createLogStream(obj.cloudwatch, obj.logGroupName, obj.logStreamName, createStreamCb);
                return;
            }
            obj.sequenceToken = data.logStreams[0].uploadSequenceToken;
            done();
        });
    } catch (err) {
        localLogger.error(err);
    }

    function createStreamCb(err, res) {
        if (err) return obj._error(err);
        // call again to verify stream was created - silently fails sometimes!
        obj._getSequenceToken(done);
    }
}

CloudWatchStream.prototype._error = function (err) {
    if (this.onError) return this.onError(err);
    localLogger.error(err);
    //throw err;
}

function createLogGroupAndStream(cloudwatch, logGroupName, logStreamName, cb) {
    try {
        cloudwatch.createLogGroup({
            logGroupName: logGroupName
        }, function (err) {
            if (err) return err;
            createLogStream(cloudwatch, logGroupName, logStreamName, cb);
        });
    } catch (err) {
        localLogger.error(err);
    }
}

function createLogStream(cloudwatch, logGroupName, logStreamName, cb) {
    try {
        cloudwatch.createLogStream({
            logGroupName: logGroupName,
            logStreamName: logStreamName
        }, cb);
    } catch (err) {
        localLogger.error(err);
    }
}

function createCWLog(bunyanLog) {
    var bunyanLogOject = JSON.parse(bunyanLog);
    var message = {};
    for (var key in bunyanLogOject) {
        if (key === 'time') continue;
        message[key] = bunyanLogOject[key];
    }

    var log = {
        message: JSON.stringify(message),
        timestamp: new Date(bunyanLogOject.time).getTime()
    };
    return log;
}


function BunyanCWError(message) {
    this.name = 'BunyanCWError';
    this.message = message || 'error in bunyan-cloudwatch';
}
BunyanCWError.prototype = Object.create(Error.prototype);
BunyanCWError.prototype.constructor = BunyanCWError;