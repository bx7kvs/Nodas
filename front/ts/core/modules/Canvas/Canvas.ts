import EventEmitter from "events";
import {ReflectPointArray2d} from "../../../@types/types";
import Ticker from "../Ticker/Ticker";
import {ReflectTickerCB} from "../Ticker/types";
import CanvasQueueElement from "./CanvasQueueElement";
import {
    ReflectCanvasContext,
    ReflectCanvasEvents,
    ReflectCanvasQueueCallback,
    ReflectCanvasQueueCallbackArgs
} from "./types";

export default class Canvas {

    private e: HTMLCanvasElement | null = null;
    private context: ReflectCanvasContext = null;
    private s: ReflectPointArray2d = [800, 600]
    private emitter = new EventEmitter()
    private q: CanvasQueueElement[] = []
    private r = false
    private args: ReflectCanvasQueueCallbackArgs = [this.context, new Date(), 0]

    private DrawScene: ReflectTickerCB = (date, frame) => {
        if (this.r) {
            this.args[0] = this.context;
            this.args[1] = date;
            this.args[2] = frame;
            this.q.forEach((qcb, i) => {
                try {
                    qcb.callback.apply(this, this.args)
                } catch (e: any) {
                    console.error(e)
                    throw new Error('Error emerged while drawing. \n' +
                        'Queue          : [' + qcb.order + ']\n' +
                        'Queue Ordering : [' + i + ']\n' +
                        'Queue Member   : [' + qcb.callback.name + ']\n' +
                        'Message        : ' + e.message);
                }
            })
        }
    }

    constructor(TickerModule: Ticker) {
        TickerModule.queue(0, this.DrawScene)
    }

    element(target: HTMLCanvasElement | string) {
        if (typeof target === "string") {
            let e = document.getElementById(target);
            if (e instanceof HTMLCanvasElement) {
                e.setAttribute('width', this.s[0].toString());
                e.setAttribute('height', this.s[1].toString());
                this.e = e;
                this.context = e.getContext('2d');
                this.r = true;
            } else throw new Error('Element with id [#' + target + '] is not a element. Can not get 2d context.')
        } else {
            target.setAttribute('width', this.s[0].toString());
            target.setAttribute('height', this.s[1].toString());
            this.e = target;
            this.context = target.getContext('2d');
            this.r = true;

        }
        this.emitter.emit(ReflectCanvasEvents.switch)
    };

    queue(a: ReflectCanvasQueueCallback | number, b?: ReflectCanvasQueueCallback) {
        if (typeof a === "number" && typeof b === "function") {
            this.q.push(new CanvasQueueElement(b, a));
        } else if (typeof a === "function") {
            this.q.push(new CanvasQueueElement(a));
        }
        this.q.sort((a, b) => {
            return a.order - b.order;
        });

        return this;
    };

    size(width: number | undefined, height: number) {
        if (typeof width === "number") {
            if (width < 0) width = 0;
            if (height < 0) height = 0;
            if (this.s[0] !== width || this.s[1] !== width) {
                this.s[0] = width;
                this.s[1] = height;
                if (this.e) {
                    this.e.setAttribute('width', width.toString());
                    this.e.setAttribute('height', height.toString());
                }
                this.emitter.emit('resize')
            }
            return this;
        } else {
            return [...this.s]
        }
    };

    resize(f: () => void) {
        this.emitter.on('resize', f)
        return this;
    };

    offResize(f: () => void) {
        this.emitter.off('resize', f)
        return this;
    }

    switch(f: () => void) {
        this.emitter.on('switch', f)
        return this;
    }

    ready() {
        return this.r
    }
}