/**
 * Created by home on 31.07.2015.
 */

class GroupScheduleDbMapper {

    _mapRemindersFromDbEntity(dbReminders) {
        let result = [];
        dbReminders.L.forEach(reminder=> {
            result.push(parseInt(reminder.N));
        });
        return result;
    }

    _mapDayTimePointsFromDbEntity(dbDayTimePoints) {
        let result = [];
        dbDayTimePoints.L.forEach(dbDayTimePoint => {
            result.push({
                reminders: this._mapRemindersFromDbEntity(dbDayTimePoint.M.reminders),
                time: dbDayTimePoint.M.time.S
            });
        });
        return result;
    }

    _mapRemindersToDbEntity(reminders) {
        let result = [];
        reminders.forEach(reminder=> {
            result.push({N: reminder.toString()});
        });
        return result;
    }

    _mapDayTimePointsToDbEntity(dayTimePoints) {
        let result = [];
        dayTimePoints.forEach(dayTimePoint => {
            result.push({
                M: {
                    reminders: {L: this._mapRemindersToDbEntity(dayTimePoint.reminders)},
                    time: {S: dayTimePoint.time}
                }
            });
        });
        return result;
    }

    mapFromDbEntity(dbEntity) {
        return {
            scheduleType: dbEntity.scheduleType.S,
            dayTimePoints: this._mapDayTimePointsFromDbEntity(dbEntity.dayTimePoints)
        }
    }

    mapToDbEntity(entity) {
        return {
            scheduleType: {S: entity.scheduleType},
            dayTimePoints: {L: this._mapDayTimePointsToDbEntity(entity.dayTimePoints)}
        };
    }
}

export default GroupScheduleDbMapper;

