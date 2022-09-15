import EventEmitter from "events";
import {NdDestructibleEventScheme} from "../@types/types";
import NdNodeStylesModel from "./NdNodeStylesModel";
import NdBaseNode from "./NdBaseNode";
import NdNodeBox from "./NdNodeBox";
import {alive} from "../decorators/alive";
import NdModBg from "../models/NdModBg";

export default class NdStyledNode<Model extends NdNodeStylesModel, Scheme extends NdDestructibleEventScheme<NdStyledNode<Model, Scheme>>> extends NdBaseNode<Scheme> {
    protected Box?: NdNodeBox;
    protected modelEmitter = new EventEmitter()
    protected order: (keyof Model)[] = []

    protected data?: Model

    constructor(styles: Model) {
        super()
        this.data = styles
        this.once('destroyed', () => {
            this.modelEmitter.removeAllListeners()
            if (this.data!.bg) NdModBg.destroyBackground(this.data! as unknown as NdModBg)
            this.Box = undefined
            this.data = undefined
        })
    }

    style(prop: keyof Model): Model[keyof Model]['publicValue']
    style<K extends keyof Model>(prop: K, value?: Parameters<Model[K]['set']>[0]): Model[keyof Model]['publicValue']
    style(props: { [Prop in keyof Model]?: Parameters<Model[Prop]['set']>[0] }): NdStyledNode<Model, Scheme>
    @alive
    style<K extends keyof Model>(
        prop: K | { [Prop in keyof Model]: Parameters<Model[Prop]['set']>[0] },
        value?: Parameters<Model[keyof Model]['set']>[0]) {
        if (typeof prop === 'object') {
            (Object.keys(prop) as K[])
                .sort((a, b) => this.order.indexOf(a) - this.order.indexOf(b))
                .forEach((key: K) => {
                    if (prop[key] !== undefined) {
                        this.data![key].set(prop[key], this)
                        this.modelEmitter.emit(<string>key)
                    }
                })
        } else {
            if (typeof value !== undefined) {
                this.data![prop].set(value, this)
                this.modelEmitter.emit(<string>prop)
                return this
            }
            return this.data![prop].publicValue
        }

        return this
    }

    @alive
    watch(prop: keyof Model | (keyof Model)[], callback: () => void): NdStyledNode<Model, Scheme> {
        if (prop instanceof Array) {
            prop.forEach(v => this.modelEmitter.on(<string>v, callback))
        } else this.modelEmitter.on(<string>prop, callback)
        return this
    }

    @alive
    unwatch(prop: keyof Model | (keyof Model)[], callback: () => void): NdStyledNode<Model, Scheme> {
        if (prop instanceof Array) {
            prop.forEach(v => this.modelEmitter.off(<string>v, callback))
        } else this.modelEmitter.off(<string>prop, callback)
        return this
    }
}