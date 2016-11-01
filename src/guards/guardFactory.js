/**
 * Created by victorcrudu on 19/09/2016.
 */
import IsMeasureNotOnTime from './isMeasureNotOnTime';

class GuardFactory{
    getGuard(name){
        switch (name) {
            case 'IsMeasureNotOnTime': {
                return new IsMeasureNotOnTime();
            }
        }
    }
}

export default new GuardFactory();