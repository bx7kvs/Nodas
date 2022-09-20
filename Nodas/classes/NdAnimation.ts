import {NdAnimationStack, NdPercentStr, NdTickingObj, NodasTickingType} from '../Nodes/@types/types';
import {ndEasings} from './NdEasings';
import NdMorphine from './NdMorphine';
import NdEmitter from './NdEmitter';
import NdEvent from './NdEvent';
import NdNodeStylesModel from "../Nodes/classes/NdNodeStylesModel";
import NdAnimatedNode from "../Nodes/classes/NdAnimatedNode";
import universalTicker from "./NdUniversalTicker";


export default class NdAnimation<Model extends NdNodeStylesModel, N extends NdAnimatedNode<Model, any> = NdAnimatedNode<Model, any>>
    extends NdEmitter<{ [key in 'step' | 'complete']: NdEvent<N, { progress: number, ease: number }> }> {
    private readonly duration: number;
    private readonly easing: keyof typeof ndEasings;
    private stack: NdAnimationStack<Model> = [];
    morphine?: NdMorphine;
    private readonly node: N
    public readonly target = null;
    private readonly _queue: boolean = false;
    private _active: boolean = false;
    private _done = false;

    constructor(node: N,
                stack: NdAnimationStack<Model>, duration: number = 1000, easing: keyof typeof ndEasings & string = 'default', queue: boolean = false) {
        super();
        this.stack = stack;
        this.easing = easing
        this.duration = duration
        this._queue = queue
        this.node = node
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

    get props(): (keyof Model)[] {
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
                        (this.node, {
                            ease: 1,
                            progress: 1
                        }));
                    (<NdMorphine>this.morphine).stop();
                } else {
                    this.stack.forEach((v) => {
                        v.result = universalTicker(value, progress, v.ani.start, v.ani.end)
                        this.node.style(v.name, v.result)
                    })
                    this.cast('step', new NdEvent<N, { progress: number; ease: number }>(
                        this.node, {
                            ease: value,
                            progress: progress
                        }))
                    if (progress === 1) {
                        this.cast('complete', new NdEvent<N, { progress: number; ease: number }>
                            (this.node,
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
}