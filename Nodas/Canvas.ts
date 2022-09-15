import {
    NdCanvasContext,
    NdCanvasQueueCallback,
    NdCanvasQueueCallbackArgs,
    NdNumericArray2d,
    NdTickerF
} from './@types/types';
import Ticker from './Ticker';
import NdQueueElement from './Canvas/NdQueueElement';
import {
    NdMouseEventData,
    NdPercentStr,
    NdRootCanvasMouseEventsScheme,
    NdRootCanvasStateEventsScheme
} from './Nodes/@types/types';
import NdMouseEvent from './classes/NdMouseEvent';
import NdEmitter from './classes/NdEmitter';
import {NDB} from './Services/NodasDebug';
import NdEvent from "./classes/NdEvent";

export default class Canvas extends NdEmitter<NdRootCanvasMouseEventsScheme & NdRootCanvasStateEventsScheme> {

    private e: HTMLCanvasElement | null = null;
    private context: NdCanvasContext = null;
    private s: [number | NdPercentStr, number | NdPercentStr] = [800, 600]
    private sNumeric: NdNumericArray2d = [800, 600]
    private resizeProcessTimeout: NodeJS.Timeout | null = null
    private q: NdQueueElement[] = []
    private _ready = false
    private _clear = false
    private args: NdCanvasQueueCallbackArgs = [this.context, new Date(), 0]
    private scroll = [window.scrollX || document.documentElement.scrollLeft, window.scrollY || document.documentElement.scrollTop]
    private offset = [0, 0]
    private cursor: NdMouseEventData = {
        cursor: [0, 0],
        page: [0, 0],
        screen: [0, 0]
    }

    private updateEventData: (e: MouseEvent) => NdMouseEventData = (e) => {
        this.cursor.page = [e.pageX, e.pageY]
        this.cursor.cursor = this.getMouseRelativePosition(e)
        this.cursor.screen = [e.pageX - this.scroll[0], e.pageY - this.scroll[1]]
        return this.cursor
    }

    private onCanvasMouseMove: (e: MouseEvent) => void = (e) => {
        this.cast('mouseMove', new NdMouseEvent<Canvas>(this, this.updateEventData(e)))
    }

    private onCanvasMouseLeave: (e: MouseEvent) => void = (e) => {
        this.cast('mouseLeave', new NdMouseEvent<Canvas>(this, this.updateEventData(e)))
    }

    private onCanvasMouseEnter: (e: MouseEvent) => void = (e) => {
        this.cast('mouseEnter', new NdMouseEvent<Canvas>(this, this.updateEventData(e)))
    }

    private onCanvasMouseDown: (e: MouseEvent) => void = (e) => {
        this.cast('mouseDown', new NdMouseEvent<Canvas>(this, this.updateEventData(e)))
    }

    private onCanvasMouseUp: (e: MouseEvent) => void = (e) => {
        this.cast('mouseUp', new NdMouseEvent<Canvas>(this, this.updateEventData(e)))
    }

    private removeEventListeners() {
        this.e?.removeEventListener('mousemove', this.onCanvasMouseMove)
        this.e?.removeEventListener('mouseleave', this.onCanvasMouseLeave)
        this.e?.removeEventListener('mouseenter', this.onCanvasMouseEnter)
        this.e?.removeEventListener('mousedown', this.onCanvasMouseDown)
        this.e?.removeEventListener('mouseup', this.onCanvasMouseUp)
    }

    private addEventListeners() {
        this.e?.addEventListener('mousemove', this.onCanvasMouseMove)
        this.e?.addEventListener('mouseleave', this.onCanvasMouseLeave)
        this.e?.addEventListener('mouseenter', this.onCanvasMouseEnter)
        this.e?.addEventListener('mousedown', this.onCanvasMouseDown)
        this.e?.addEventListener('mouseup', this.onCanvasMouseUp)
    }

    private recalculateOffset() {
        if (this.e) {
            const rect = this.e.getBoundingClientRect()
            this.offset = [rect.x + this.scroll[0], rect.y + this.scroll[1]]
        }
    }

    private getMouseRelativePosition(event: MouseEvent): NdNumericArray2d {
        return [event.pageX - this.offset[0] - this.scroll[0], event.pageY - this.offset[1] - this.scroll[1]];
    }

    private recalculateSize() {
        if (this.e) {
            const parentHTMLNode = this.e.parentNode as HTMLElement;
            if (parentHTMLNode) {
                const parenBoundingRect = parentHTMLNode.getBoundingClientRect(),
                    parentHeight = parenBoundingRect.height,
                    parentWidth = parenBoundingRect.width;
                if (typeof this.s[0] === 'string') {
                    const wPercent = parseInt(this.s[0]) / 100
                    this.sNumeric[0] = parentWidth * wPercent
                } else this.sNumeric[0] = this.s[0]
                if (typeof this.s[1] === 'string') {
                    const hPercent = parseInt(this.s[1]) / 100
                    this.sNumeric[1] = parentHeight * hPercent
                } else this.sNumeric[1] = this.s[1]
                this.e.setAttribute('width', this.sNumeric[0].toString())
                this.e.setAttribute('height', this.sNumeric[1].toString())
            } else NDB.warn('Current canvas element is detached from DOM. Size reset skipped')
            this.recalculateOffset()
        } else NDB.warn('No Canvas to operate. Size reset skipped')
    }

    private handleResize() {
        if (this.e) {
            if (typeof this.s[0] === 'string' || typeof this.s[1] === 'string') {
                this.e.setAttribute('width', '0')
                this.e.setAttribute('height', '0')
                if (this.resizeProcessTimeout) clearTimeout(this.resizeProcessTimeout)
                this.resizeProcessTimeout = setTimeout(() => {
                    this.recalculateSize()
                    this.cast('resize', new NdEvent(this, null))
                }, 1000)
            } else {
                if (this.resizeProcessTimeout) clearTimeout(this.resizeProcessTimeout)
                this.sNumeric[0] = this.s[0]
                this.sNumeric[1] = this.s[1]
                this.recalculateSize()
                this.cast('resize', new NdEvent(this, null))
            }
        }
    }

    private DrawScene: NdTickerF = (date, frame) => {
        if (this._ready && this.context) {
            if (this._clear) {
                this.context.clearRect(0, 0, this.context.canvas.offsetWidth, this.context.canvas.offsetHeight)
            }
            this.args[0] = this.context;
            this.args[1] = date;
            this.args[2] = frame;
            this.q.forEach((qcb) => {
                qcb.callback.apply(this, this.args)
            })
        }
    }


    constructor(TickerModule: Ticker) {
        super()
        TickerModule.queue(0, this.DrawScene)
        window.addEventListener('scroll', () => {
            this.scroll[0] = window.scrollX || document.documentElement.scrollLeft;
            this.scroll[1] = window.scrollY || document.documentElement.scrollTop;
        });
        window.addEventListener('resize', () => this.handleResize())
    }

    element(target: HTMLCanvasElement | string) {
        if (typeof target === 'string') {
            let e = document.querySelector(target);
            if (e instanceof HTMLCanvasElement) {
                e.setAttribute('width', this.sNumeric[0].toString());
                e.setAttribute('height', this.sNumeric[1].toString());
                this.removeEventListeners()
                this.e = e;
                this.context = e.getContext('2d');
                this.addEventListeners()
                this._ready = true;
                NDB.positive(`Accepted ${target} as rendering root`)
            } else NDB.error(`Element ${target} is not a HTMLCanvasElement or does not exist`)
        } else {
            target.setAttribute('width', this.sNumeric[0].toString());
            target.setAttribute('height', this.sNumeric[1].toString());
            this.removeEventListeners()
            this.e = target;
            this.context = target.getContext('2d');
            this.addEventListeners()
            this._ready = true;
            NDB.positive(`Accepted ${target.id ? target.id : target.classList.toString()} as rendering root`)
        }
        this.handleResize()
        this.cast('switch', new NdEvent<Canvas, null>(this, null))
    };

    queue(a: NdCanvasQueueCallback | number, b?: NdCanvasQueueCallback) {
        if (typeof a === 'number' && typeof b === 'function') {
            this.q.push(new NdQueueElement(b, a));
        } else if (typeof a === 'function') {
            this.q.push(new NdQueueElement(a));
        }
        this.q.sort((a, b) => {
            return a.order - b.order;
        });

        return this;
    };

    unQueue(callback: NdCanvasQueueCallback) {
        this.q = this.q.filter((qE) => qE.callback !== callback)
        NDB.warn('Callback removed form canvas queue')
    }

    size(width?: number | NdPercentStr, height?: number | NdPercentStr) {
        if (typeof width === 'number' || typeof width === 'string') {
            if (typeof height === 'number' || typeof height === 'string') {
                this.s[0] = width
                this.s[1] = height
                this.handleResize()
            } else NDB.error(`Invalid Canvas size [${width}, ${height}]`)
        } else {
            return [...this.sNumeric]
        }
    };

    forceResize() {
        this.handleResize()
    }


    get ready() {
        return this._ready
    }

    get clear() {
        return this._clear
    }

    set clear(value) {
        this._clear = value
    }
}