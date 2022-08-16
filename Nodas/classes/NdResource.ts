import {NdExportable, NdURLStr} from '../Nodes/@types/types';
import NdEmitter from './NdEmitter';

export default abstract class NdResource<T extends NdExportable> extends NdEmitter<{ load: null, error: null }> {
    private readonly src: NdURLStr
    private readonly resolve: () => NdResource<T>
    protected _status: number = -1
    protected resolved: boolean = false
    abstract readonly export: T | ((...args:any) => void)


    constructor(url: NdURLStr, resolve: () => NdResource<T>) {
        super()
        this.src = url
        this.resolve = resolve
    }

    get url(): NdURLStr {
        return this.src
    }

    get loaded() {
        return this._status > 0
    }

    get error() {
        return this._status == 0
    }

    load() {
        if(!this.resolved) {
            this.resolved = true
            return this.resolve()
        }
        return this
    }
}
