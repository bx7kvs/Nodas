import {NdTickerEventCb, NdTickerEvents, NdTickerEventsContainer, NdTickerFArgs, NdTickerQueueF, NdTickerQueueItem} from './@types/types';
import {NDB} from './Services/NodasDebug';


export default class Ticker {
    private frameDuration = (1000 / 58.8);
    private q: NdTickerQueueItem[] = [];
    private frame = 0;
    private args: NdTickerFArgs = [new Date(), 0];
    private interval?: ReturnType<Window['setInterval']>;
    private eventsCb: NdTickerEventsContainer = {
        stop: [],
        start: [],
        error: []
    }

    private draw() {
        this.q.forEach((f, key) => {
            try {
                this.q[key].f.apply(self, this.args);
            } catch (e: any) {
                NDB.error(`Error emerged while running ticker\n Queue: ${this.q[key].order}\n Order: ${key}\n Message: ${e.message}`)
            }
        })
        this.frame++;
    }

    private tick: () => void = () => {
        this.args[0] = new Date();
        this.args[1] = this.frame;
        try {
            this.draw();
        } catch (e: any) {
            window.clearInterval(this.interval);
            this.resolve('error', e);
            NDB.error(`Application ticker collapsed\n Frame: ${this.frame}\n Date: ${this.args[0]}\n Message: ${e.message}`)
        }
    }

    private resolve(event: NdTickerEvents, args: Error | Ticker) {
        this.eventsCb[event].forEach(
            (cb) => {
                cb.apply(this, [args])
            }
        )
    }

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

    on(event: NdTickerEvents, cb: NdTickerEventCb) {
        this.eventsCb[event].push(cb)
    }

    stop() {
        if (this.interval) {
            this.frame = 0;
            clearInterval(this.interval);
            this.interval = undefined;
            this.resolve('stop', this);
            NDB.positive('Ticker stopped')
        } else NDB.warn(`Ticker already stopped. Ignored`)
        return this;
    }

    start() {
        if (!this.interval) {
            this.interval = window.setInterval(this.tick, this.frameDuration);
            this.resolve('start', this);
            NDB.positive('Ticker started')
        }else NDB.warn(`Ticker already started. Ignored`)
        return this;
    };

    get frameTime() {
        return this.frameDuration
    }

    fps(fps: number) {
        if (fps > 60) fps = 60;
        if (fps <= 0) fps = 1;
        this.frameDuration = (1000 / fps);
        NDB.positive(`Ticker FPS set ${fps}. Restart Ticker`)
        if (this.interval) {
            this.stop();
            this.start();
        }
        return this;
    };
}