/**
 * Created by victorcrudu on 19/09/2016.
 */
import awsFactory from '../awsFactory';
import repositoriesFactory from '../repositories/repositoriesFactory';
import moment from 'moment';
import util from 'util';
import logging from '../logging';

class IsMeasureNotOnTime {
    check(stateEvent, callback) {
        let eventsRepository = repositoriesFactory.getEventsRepository(awsFactory.getDb());
        let getGlobalMeasurementScheduleRepository = repositoriesFactory.getGlobalMeasurementScheduleRepository(awsFactory.getDb());
        getGlobalMeasurementScheduleRepository.getOne(stateEvent.payload.scheduleType, (err, measurementSchedule)=> {
            eventsRepository.getLastOne(stateEvent.payload.userId,
                stateEvent.payload.scheduleType,
                (err, event)=> {
                    if (err || !event) {
                        callback(false);
                    } else {
                        let eventTime = moment(event.measurementDateTime);

                        logging.getLogger().info('Check measurementSchedule: '+util.inspect(stateEvent,{depth:null}));

                        let eventScheduleInterval = measurementSchedule.dayTimePoints
                            .map(dayTimePoint=> {
                                let today = moment().startOf('day').format('MM-DD-YYYY');
                                let pointTimeString = today + ' ' + dayTimePoint.time;
                                dayTimePoint.momentTime = moment(pointTimeString, 'MM-DD-YYYY HH:mma');
                                return dayTimePoint;
                            })
                            .find((item)=> {

                                let startOfPrevPeriodOffset = item.reminders.concat([0]).reduce((prevOffset, curOffset)=> {
                                    return Math.min(prevOffset, curOffset);
                                });
                                let endOfPrevPeriodOffset = item.reminders.concat([0]).reduce((prevOffset, curOffset)=> {
                                    return Math.max(prevOffset, curOffset);
                                });

                                let startOfPrevPeriodTime = moment(item.momentTime).add(startOfPrevPeriodOffset, 'm');
                                let endOfPrevPeriodTime = moment(item.momentTime).add(endOfPrevPeriodOffset, 'm');


                                return moment(eventTime).isBetween(startOfPrevPeriodTime, endOfPrevPeriodTime, null, '[]') &&
                                    moment(stateEvent.runAt).isBetween(startOfPrevPeriodTime, endOfPrevPeriodTime, null, '[]');
                            });

                        callback(null, !eventScheduleInterval);
                    }
                }
            );
        });
    }

    get name() {
        return 'IsMeasureNotOnTime';
    }

}

export default IsMeasureNotOnTime;