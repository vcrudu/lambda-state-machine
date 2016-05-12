/**
 * Created by Victor on 17/08/2015.
 */

(function() {
    var bunyan = require('bunyan');
    var createCWStream = require('./cloudwatch');

    var streamCW = createCWStream({
        accessKeyId:'AKIAI3IGUJPNNVRFFMDA',
        secretAccessKey:'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',
        logGroupName: 'hcm',
        logStreamName: 'hcm.registration',
        region: 'eu-west-1'
    });

    var defaultLogger = bunyan.createLogger({
        name: 'hcm.registration',
        streams: [
            {
                level: 'debug',
                stream: process.stdout            // log INFO and above to stdout
            },
            {
                level: 'trace',
                stream: streamCW            // log INFO and above to stdout
            },
            {
            level: 'trace',
            type: 'rotating-file',
            path: './log/hcm.log',
            period: '1d',   // daily rotation
            count: 3        // keep 3 back copies
        }]
    });

    var localLogger = bunyan.createLogger({
        name: 'hcm.registration.local',
        streams: [
            {
                level: 'trace',
                type: 'rotating-file',
                path: './log/hcm.log',
                period: '1d',   // daily rotation
                count: 3        // keep 3 back copies
            }]
    });

    function getIncidentTicketNumber(componentCode) {
        var dateTime = new Date();
        return componentCode + dateTime.getDate() + dateTime.getMonth() + dateTime.getHours() + dateTime.getMinutes();
    }

    function getUserErrorMessage(incidentTicket) {
        return "Something went wrong! We apologize about this." +
            " Use please the incident ticket " + incidentTicket + " and contact please our support.";
    }

    function getLogger() {
        return defaultLogger;
    }


    function getLocalLogger() {
        return localLogger;
    }

    function processUnhandledError(req, error, callback) {
        var incidentTicket = logging.getIncidentTicketNumber("or");
        getLogger().error({
            incident: incidentTicket,
            url: req.url,
            userId: req.decoded.email
        }, error);
        var unhandledError = new Error(logging.getUserErrorMessage(incidentTicket));
        unhandledError.unhandled = true;
        callback(unhandledError, null);
    }

    module.exports = {
        getIncidentTicketNumber: getIncidentTicketNumber,
        getUserErrorMessage: getUserErrorMessage,
        getLogger: getLogger,
        getLocalLogger: getLocalLogger,
        processUnhandledError: processUnhandledError
    };
})();