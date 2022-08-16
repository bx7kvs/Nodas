import NdConfigProperty from './Config/NdConfigProperty';
import {NdConfigPropertyChecks, NdConfigPropertyWatcher} from './@types/types';


export default class Config {
    private properties: { [key: string]: NdConfigProperty<any> } = {};

    define<T>(property: string, value: T, cfg: NdConfigPropertyChecks): NdConfigProperty<T> {
        if (!this.properties[property]) {
            try {
                this.properties[property] = new NdConfigProperty<T>(property, value, cfg);
            } catch (e) {
                console.error('Unable to create config property [' + property + ']')
                throw e;
            }
        } else {
            console.warn('Config property duplication on property name [' + property + ']');
        }

        return this.properties[property];
    };

    set<T>(name: string, value: T): Config {
        if (this.properties[name]) {
            this.properties[name].define(value);
        } else throw new Error('Unable to set property [' + name + ']. No such property.');
        return this
    }

    get<T>(name: string): T {
        if (this.properties[name]) {
            return this.properties[name].value()
        } else throw new Error('Unable to get property [' + name + ']. No such property.')
    }

    watch<T>(name: string, f: NdConfigPropertyWatcher<T>) {
        if (this.properties[name]) {
            return this.properties[name].watch(f);
        } else throw new Error('No such property as [' + name + '] to watch.');
    }
}