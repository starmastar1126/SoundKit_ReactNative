import {AsyncStorage} from 'react-native';

export const STORAGE_NAME = "@crea8socialAPP";

export class Storage {
    constructor() {
        this.storageName = STORAGE_NAME;
    }

    multiGet(keys, callback) {
        let newKeys = [];

        for (i = 0; i <= keys.length;i++) {
            newKeys.push(this.format(keys[i]));
        }
        //console.log(newKeys);
        return AsyncStorage.multiGet(newKeys, callback);
    }

    get(name, defaultValue) {
        return AsyncStorage.getItem(`${this.storageName}:${name}`);
    }

    async set(name, value) {
       await AsyncStorage.setItem(`${this.storageName}:${name}`, value);
    }

    remove(name) {
        return  AsyncStorage.removeItem(`${this.storageName}:${name}`);
    }

    format(name) {
        return this.storageName + ':' + name;
    }

    preLoad(func) {
        return this.multiGet(['userid', 'password','user_name','did_getstarted','avatar','cover','api_key','language','theme','changetheme','setup_data'], func)
    }

    isLoggedIn() {
        return this.get('userid', false)
    }

    logout() {

        this.remove('password');
        return this.remove('userid');
    }

    getUserid() {
        return this.isLoggedIn();
    }
}

const storage = new Storage();

export default  storage;