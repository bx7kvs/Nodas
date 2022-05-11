import {ReflectMainDrawingPipeCallback, ReflectPointArray2d} from "../../../@types/types";
import Canvas from "./Canvas";
import ReflectElement from "../ReflectElement";
import Emitter from "../../../core/classes/Emitter";
import {ReflectAssemblerContextResolver, ReflectGraphicsCompilerPipe} from "../@types/types";
import ReflectElementAssemblerLayer from "./ReflectElementAssemblerLayer";

export default class ReflectElementAssembler<T extends ReflectElement<any>> extends Emitter<'resize' | 'update', {
    target: T
}> {
    private output = new Canvas()
    private pipe: { order: number, layer: ReflectElementAssemblerLayer }[] = []
    private layers: { [key: string]: ReflectElementAssemblerLayer } = {}
    private w = 0
    private h = 0
    private resized = false
    private _ready = false;
    private element: T

    constructor(element: T) {
        super()
        this.element = element

    }

    get ready() {
        return this._ready
    }

    get size() {
        return [this.w, this.h]
    }

    private set size(size: ReflectPointArray2d) {
        this.w = size[0]
        this.h = size[1]
        this.output.width = size[0]
        this.output.height = size[1]
        this.pipe.forEach(({layer}) => {
            layer.size = [this.w, this.h]
        })
    }

    export() {
        if (!this.resized) {
            if (this.element.spriteBox.size[0] !== this.w || this.element.spriteBox.size[1] !== this.h) {
                this.size = [this.element.spriteBox.size[0], this.element.spriteBox.size[1]]
            }
            this.resized = true;
        }
        if (!this._ready) {
            this.output.context.clearRect(0, 0, this.w, this.h)
            this.pipe.forEach((v) => {
                v.layer.draw(this.output.context)
            })
            this._ready = true;
        }
        return this.output.element
    }

    layer(layer: ReflectElementAssemblerLayer, name: string, order: number = 0) {
        this.layers[name] = layer
        this.pipe.push({order, layer})
        this.pipe.sort((a, b) => a.order - b.order)
        this._ready = false
    }
    get width () {
        return this.w;
    };
     get height () {
        return this.h;
    };

     resize () {
        this.resized = false;
        this._ready = false;
    };
     update (name:string) {
        this._ready = false;
        this.layers[name].update();
    };
}