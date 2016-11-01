/**
 * Created by home on 31.07.2015.
 */

class EventDbMapper {


    mapEventToDbEntity(event) {

        if(event.measurementType=="heartRate"){
            return {
                heartRate:{N:event.heartRate.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        }else if(event.measurementType=="bloodPressure"){
            return {
                bloodPressure:{
                    M:{
                        systolic:{N:event.bloodPressure.systolic.toString()},
                        diastolic:{N:event.bloodPressure.diastolic.toString()}
                    }
                },
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        } else if( event.measurementType=="bloodGlucose"){
            return {
                bloodGlucose:{N:event.bloodGlucose.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        } else if(event.measurementType=="bloodOxygen"){
            return {
                bloodOxygen:{N:event.bloodOxygen.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        }else if(event.measurementType=="respiratoryRate"){
            return {
                respiratoryRate:{N:event.respiratoryRate.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        }else if(event.measurementType=="temperature"){
            return {
                temperature:{N:event.temperature.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        } if(event.measurementType=="weight"){
            return {
                weight:{N:event.weight.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        } else if(event.measurementType=="fallDetection"){
            return {
                fallDetection:{BOOL:event.fallDetection.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        } else if(event.measurementType=="bloodInr"){
            return {
                bloodInr:{N:event.bloodInr.toString()},
                userId:{S:event.userId},
                measurementType:{S:event.measurementType},
                measurementDateTime:{N:event.measurementDateTime.getTime().toString()}
            };
        }

    }

    mapEventFromDbEntity(dbEntity) {
        let measurementDateTime = new Date();
        measurementDateTime.setTime(parseInt(dbEntity.measurementDateTime.N));

        if(dbEntity.measurementType.S=="heartRate"){
            return {
                heartRate:parseInt(dbEntity.heartRate.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        }else if(dbEntity.measurementType.S=="bloodPressure"){
            return{
                bloodPressure:{
                    systolic:parseInt(dbEntity.bloodPressure.M.systolic.N),
                    diastolic:parseInt(dbEntity.bloodPressure.M.diastolic.N)
                },
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        } else if( dbEntity.measurementType.S=="bloodGlucose"){
            return {
                bloodGlucose:parseFloat(dbEntity.bloodGlucose.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        } else if(dbEntity.measurementType.S=="bloodOxygen"){
            return {
                bloodOxygen:parseInt(dbEntity.bloodOxygen.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        }else if(dbEntity.measurementType.S=="respiratoryRate"){
            return {
                respiratoryRate:parseInt(dbEntity.respiratoryRate.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        }else if(dbEntity.measurementType.S=="temperature"){
            return {
                temperature:parseFloat(dbEntity.temperature.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        } if(dbEntity.measurementType.S=="weight"){
            return {
                weight:parseFloat(dbEntity.weight.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        } else if(dbEntity.measurementType.S=="fallDetection"){
            return {
                fallDetection:dbEntity.fallDetection.BOOL=='true',
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        } else if(dbEntity.measurementType.S=="bloodInr"){
            return {
                bloodInr:parseFloat(dbEntity.bloodInr.N),
                userId:dbEntity.userId.S,
                measurementDateTime:measurementDateTime,
                measurementType:dbEntity.measurementType.S
            };
        }
        throw new Error('Could not map event entity from db entity. Invalid event db entity!');
    }
}

export default EventDbMapper;

