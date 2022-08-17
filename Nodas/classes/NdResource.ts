import {NdExportable, NdURLStr} from '../Nodes/@types/types';
import NdEmitter from './NdEmitter';
import {NDB} from '../Services/NodasDebug';

export default abstract class NdResource<T extends NdExportable> extends NdEmitter<{ load: null, error: null }> {
    private readonly src: NdURLStr
    private readonly resolve: () => NdResource<T>
    protected _status: number = -1
    protected resolved: boolean = false
    protected _destroyed: boolean = false
    abstract readonly export: T | ((...args: any) => void)


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

    get destroyed() {
        return this._destroyed
    }

    destroy() {
        if (!this._destroyed) {
            this.removeAllListeners()
            this._destroyed = true
        } else NDB.warn(`Destroying already destroyed resource ${this.url}. Ignored`)
    }

    load() {
        if (!this._destroyed) {
            if (!this.resolved) {
                this.resolved = true
                return this.resolve()
            }
        } else NDB.warn(`Trying to load destroyed resource ${this.url}. Ignored`)
        return this
    }
}
