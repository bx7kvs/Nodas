import {NdListenable} from '../@types/types';
import {EventEmitter} from 'events';

export default class NdEmitter<Scheme, K extends keyof Scheme = keyof Scheme> implements NdListenable<Scheme, K> {
    private Emitter = new EventEmitter()
    protected cast(event: keyof Scheme, data: Scheme[K]): Scheme[K] {
        this.Emitter.emit(<string>event, data)
        return data
    }

    protected reset() {
        this.Emitter.removeAllListeners()
    }
    on(event: K | (K)[], callback: (event: Scheme[K]) => void) {
        event instanceof Array ?
            event.forEach(e => this.Emitter.on(<string>e, callback)) :
            this.Emitter.on(<string>event, callback)
    }

    once(event: K| (K)[], callback: (event: Scheme[K]) => void) {
        this.Emitter.once(<string>event, callback)
    }

    off(event: K| (K)[], callback: (event: Scheme[K]) => void) {
        this.Emitter.off(<string>event, callback)
    }

}