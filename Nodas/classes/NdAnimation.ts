import {NdAnimationStack, NdPercentStr, NdTickingObj, ReflectTickingType} from '../Nodes/@types/types';
import {ndEasings} from './NdEasings';
import NdMorphine from './NdMorphine';
import NdEmitter from './NdEmitter';
import NdEvent from './NdEvent';
import NdModBase from '../Nodes/models/NdModBase';
import Node from '../Nodes/Node'


export default class NdAnimation<Model extends NdModBase, N extends Node<Model> = Node<Model>>
    extends NdEmitter<{ [key in 'step' | 'complete']: NdEvent<N, { progress: number, ease: number }> }> {
    private duration: number;
    private easing: keyof typeof ndEasings;
    private stack: NdAnimationStack<Model> = [];
    morphine?: NdMorphine;
    private element: N
    public readonly target = null;
    private readonly _queue: boolean = false;
    private _active: boolean = false;
    private _done = false;

    constructor(element: N,
                stack: NdAnimationStack<Model>, duration: number = 1000, easing: keyof typeof ndEasings & string = 'default', queue: boolean = false) {
        super();
        this.stack = stack;
        this.easing = easing
        this.duration = duration
        this._queue = queue
        this.element = element
    }

    get queue() {
        return this._queue
    }

    get active() {
        return this._active;
    }

    get done() {
        return this._done;
    }

    indexOf(property: string) {
        return this.stack.findIndex(v => v.name === property)
    }

    get props() {
        return this.stack.map(v => v.name)
    }

    stop(property?: string) {
        if (property) {
            const index = this.indexOf(property.toString())
            if (index > -1) this.stack.splice(index, 1)
        } else {
            this.stack = []
        }
    }

    start() {
        if (this.active) return;
        this._active = true
        this.stack = this.stack.filter(
            (v) =>
                v.ani.init(v.value) && v.ani.start !== false && v.ani.end !== false)
        this.morphine = new NdMorphine(0, 1, this.duration,
            (progress, value) => {
                if (this.stack.length === 0) {
                    this.cast('complete',
                        new NdEvent<N, { progress: number; ease: number }>
                        (this.element, {
                            ease: 1,
                            progress: 1
                        }));
                    (<NdMorphine>this.morphine).stop();
                } else {
                    this.stack.forEach((v) => {
                        v.result = this.tick(value, progress, v.ani.start, v.ani.end)
                        this.element.style(v.name, v.result)
                    })
                    this.cast('step', new NdEvent<N, { progress: number; ease: number }>(
                        this.element, {
                            ease: value,
                            progress: progress
                        }))
                    if (progress === 1) {
                        this.cast('complete', new NdEvent<N, { progress: number; ease: number }>
                            (this.element,
                                {
                                    progress: 1,
                                    ease: 1
                                })
                        )
                    }

                }
            }, ndEasings[this.easing], 0
        )

    }

    private tick(complete: number, progress: number, start: ReflectTickingType, end: ReflectTickingType):
        ReflectTickingType {
        while (typeof start === 'function') {
            start = start()
        }
        while (typeof end === 'function') {
            end = end()
        }
        let result: ReflectTickingType = end;
        if (typeof start === typeof end) {
            if (typeof start === 'number') {
                if (progress >= 1) {
                    result = end;
                } else {
                    result = start + (((end as number) - start) * complete);
                }
            }
            if (typeof start === 'string') {
                const startVal = parseFloat(start)
                const endVal = parseFloat(end as NdPercentStr)
                result = (startVal + (((endVal as number) - startVal) * complete)) + '%' as NdPercentStr;
            }
            if (typeof start == 'object') {
                if (Array.isArray(start) && Array.isArray(end)) {
                    if (start.length == end.length) {
                        result = start.map((v, key) => {
                            return this.tick(complete, progress, v, (end as ReflectTickingType[])[key])

                        })
                    } else {
                        throw new Error('Start and end values are of different lengths')
                    }
                } else {
                    result = Object.fromEntries((Object.keys(start) as (keyof { [key: string]: ReflectTickingType })[]).map((prop) => {
                        return [prop, this.tick(complete, progress, (start as NdTickingObj)[prop], (end as NdTickingObj)[prop])]
                    }))
                }
            }
        } else throw new Error('start value and end value are of different types')
        return result;
    }
}