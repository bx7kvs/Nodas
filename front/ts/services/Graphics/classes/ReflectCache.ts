import value from "../../../../../../components/partials/Value/Value";
import Application from "../../../core/modules/Application/Application";
import {
    ReflectCacheGetter, ReflectCacheRegister,
    ReflectCacheRegisterReturn,
    ReflectCacheStorage,
    ReflectCacheStorageItem
} from "../@types/types";

export default class ReflectCache{
    private values:ReflectCacheStorage = {}
    private app:Application;
    constructor(app:Application) {
        this.app = app
    }
    register<T> (name:string, func:ReflectCacheGetter<T>):ReflectCacheRegisterReturn<T> {
        if (!this.values[name]) {
            const item:ReflectCacheStorageItem<T> = {
                value: func(),
                getter: func,
                relevant: true
            }
            this.values[name] = item
        }
        const result:ReflectCacheRegisterReturn<T> = {
            purge: () => {
                this.values[name].relevant = false
            },
            getter: () => {
                if (!this.values[name].relevant) {
                    this.values[name].value = this.values[name].getter();
                    this.values[name].relevant = true;
                }

                return this.values[name].value;
            }
        }
        return result
    };
}