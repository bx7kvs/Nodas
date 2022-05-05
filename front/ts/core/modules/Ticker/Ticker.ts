import {
    ReflectTickerCallArgs, ReflectTickerEventCB,
    ReflectTickerEvents,
    ReflectTickerEventsContainer,
    ReflectTickerQueueItem,
    ReflectTickerQueueMethod
} from "./types";

export default class Ticker {
    private frameDuration = (1000 / 58.8);
    private q:ReflectTickerQueueItem[] = [];
    private frame = 0;
    private args:ReflectTickerCallArgs = [new Date(), 0];
    private interval?: ReturnType<Window["setInterval"]>;
    private eventsCb:ReflectTickerEventsContainer = {
        stop: [],
        start: [],
        error: []
    }

    private draw () {
        this.q.forEach((f,key) => {
            try {
                this.q[key].f.apply(self, this.args);
            }
            catch (e:any) {
                throw new Error('Error emerged while resolving callbacks.\n' +
                    'Queue   : [' + this.q[key].order + ']\n' +
                    'Order   : [' + key + ']\n' +
                    'Name    : [' + (this.q[key].f.name) + '].\n' +
                    'Message : ' + e.message);
            }
        })
        this.frame++;
    }
    private tick () {
        this.args[0] = new Date();
        this.args[1] = this.frame;
        try {
            this.draw();
        }
        catch (e:any) {
            window.clearInterval(this.interval);
            this.resolve('error', e);
            throw new Error('Unable to run ticker anymore. ' +
                'Error emerged during sources ticker progress.\n ' +
                'Frame :' + this.frame + '\n' +
                'Date  : ' + this.args[0] + '\n' +
                e.message
            );
        }
    }
    private resolve(event:ReflectTickerEvents, args?:Error | Ticker) {
        this.eventsCb[event].forEach(
            (cb)=>{
                cb.apply(this,[args])
            }
        )
    }
    queue:ReflectTickerQueueMethod = (a, b) => {
        if (typeof a === "function") {
            if (!a.name) throw new Error('Unable to set callback. Callback is not a named function.');
            this.q.push({order: 0, f: a});
        }
        else {
            if (typeof b === "function") {
                if (!b.name) throw new Error('Unable to set callback. Callback is not a named function.');
                this.q.push({order: a, f: b});
            }
            else {
                throw new Error('Unable to queue. callback is not a function')
            }
        }
        this.q.sort(function (a,b) {
            return a.order - b.order;
        });
        return this;
    }
    on(event:ReflectTickerEvents,cb:ReflectTickerEventCB) {
        this.eventsCb[event].push(cb)
    }
    stop() {
        if (this.interval) {
            this.frame = 0;
            clearInterval(this.interval);
            this.interval = undefined;
            this.resolve('stop', this);
        }
        return this;
    }

    start () {
        if (!this.interval) {
            this.interval = window.setInterval(this.tick, this.frameDuration);
            this.resolve('start', this);
        }
        return this;
    };

    fps (fps:number) {
        if (fps > 60) fps = 60;
        if (fps <= 0) fps = 1;
        this.frameDuration = (1000 / fps);
        if (this.interval) {
            this.stop();
            this.start();
        }
        return this;
    };
}