import {NdTickerEvents, NdTickerFArgs, NdTickerQueueF, NdTickerQueueItem} from './@types/types';
import {NDB} from './Services/NodasDebug';
import NdEmitter from "./classes/NdEmitter";


export default class Ticker extends NdEmitter<NdTickerEvents> {
    private frameDuration = (1000 / 60);
    private q: NdTickerQueueItem[] = [];
    private frame = 0;
    private _fps = 60;
    private args: NdTickerFArgs = [new Date(), 0];
    private interval?: ReturnType<Window['setInterval']>;
    private init = false
    private softPause = false

    constructor() {
        super();
        window.addEventListener('blur', () => {
            NDB.positive('Window blurred. Pause')
            this.softPause = true
            this.stop()
        })
        window.addEventListener('focus', () => {
            if (this.softPause) {
                NDB.positive('Window focused. Restart')
                this.softPause = false
                this.start()
            }
        })
    }

    private tick: () => void = () => {
        this.args[0] = new Date();
        this.args[1] = this.frame;
        try {
            this.draw();
        } catch (e: any) {
            this.stop()
            throw e
        }
    }

    start() {
        if (!this.interval) {
            this.interval = window.setInterval(this.tick, this.frameDuration)
            if (!this.init) {
                this.cast("fps", null)
                this.init = true
            }
            this.cast('start', null);
            NDB.positive('Ticker started')
        } else NDB.warn(`Ticker already started. Ignored`)
        return this;
    };


    queue: NdTickerQueueF = (a, b) => {
        if (typeof a === 'function') {
            this.q.push({order: 0, f: a});
        } else {
            if (typeof b === 'function') {
                this.q.push({order: a, f: b});
            } else NDB.warn(`Ticker callback is not a function. Ignored`)
        }
        this.q.sort(function (a, b) {
            return a.order - b.order;
        });
        return this;
    }

    stop() {
        if (this.interval) {
            this.frame = 0;
            clearInterval(this.interval);
            this.interval = undefined;
            this.cast('stop', null);
            NDB.positive('Ticker stopped')
        } else NDB.warn(`Ticker already stopped. Ignored`)
        return this;
    }

    private draw() {
        this.q.forEach((f, key) => {
            try {
                this.q[key].f.apply(self, this.args);
            } catch (e: any) {
                throw e
            }
        })
        this.frame++;
    }

    get frameTime() {
        return this.frameDuration
    }

    set fps(fps: number) {
        if (fps > 60) fps = 60;
        if (fps <= 0) fps = 1;
        this.frameDuration = (1000 / fps);
        this.cast("fps", null)
        NDB.positive(`Ticker FPS set ${fps}. Restart Ticker`)
        if (this.interval) {
            this.stop();
            this.start();
        }
    }
    get fps() {
        return this._fps
    }
}