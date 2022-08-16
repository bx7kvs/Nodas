import {NdCacheGetter, NdCacheRegisterFReturn, NdCacheStorage} from '../Nodes/@types/types';

export default class NdCache {
    private values: NdCacheStorage = {}

    register<T>(name: string, func: NdCacheGetter<T>): NdCacheRegisterFReturn<T> {
        if (!this.values[name]) {
            this.values[name] = {
                value: undefined,
                getter: func,
                relevant: false
            }
        }
        return {
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
        } as NdCacheRegisterFReturn<T>
    };
}