import {NdNumericArray2d} from '../../@types/types';
import NdCanvas from '../../classes/NdCanvas';
import Node from '../Node';
import NdLayer from '../../classes/NdLayer';
import {NDB} from "../../Services/NodasDebug";
import {alive} from "../decorators/alive";
import {AssemblerLayerConfig, NdNodeAssemblerEventScheme, NodasAssemblerUpdateF} from "../@types/types";
import NdStateEvent from "../../classes/NdStateEvent";
import NdDestroyableNode from "./NdDestroyableNode";

export default class NdNodeAssembler extends NdDestroyableNode<NdNodeAssemblerEventScheme<NdNodeAssembler>> {
    private output?: NdCanvas = new NdCanvas()
    private pipe?: { order: number, layer: NdLayer }[] = []
    private layers?: { [key: string]: NdLayer } = {}
    private w = 0
    private h = 0
    private resized = false
    private _ready = false;
    public update: NodasAssemblerUpdateF<AssemblerLayerConfig[]> = () => {
    }

    constructor(
        layers: AssemblerLayerConfig[]
    ) {
        super()
        this.layers =
            Object.fromEntries(
                layers.map((value, key) => {
                    if (this.pipe) {
                        const layer = new NdLayer(value.resolver)
                        this.pipe.push({
                            order: key,
                            layer: layer
                        })
                        return [value.name, layer]
                    } else throw new Error('How did you get here?')

                })) as { [key: string]: NdLayer }

        this.pipe!.sort((a, b) => a.order - b.order)
        this.update = (name) => {
            if (!this.destroyed) {
                if (name) {
                    if (this.layers![name]) {
                        this._ready = false;
                        this.layers![name].update();
                    }
                } else {
                    Object.values(this.layers!).forEach((v) => {
                        v.update()
                    })
                }
            } else NDB.warn('Attempt to update a destroyed Node Assembler. Ignored')
        }
        this.once('destroyed', () => {
            this.output = undefined
            this.pipe = undefined
            Object.values(this.layers!).forEach(v => v.destroy())
            this.layers = undefined
        })
    }

    @alive
    get ready() {
        return this._ready && !this.destroyed
    }

    @alive
    get size() {
        if (this.destroyed) {
            NDB.warn('Attempt to access size of a destroyed Node Assembler')
            return [0, 0]
        }
        return [this.w, this.h]
    }

    @alive
    get width() {
        if (this.destroyed) {
            NDB.warn('Attempt to access width of a destroyed Node Assembler')
            return 0
        }
        return this.w;
    };

    @alive
    get height() {
        if (this.destroyed) {
            NDB.warn('Attempt to access height of a destroyed Node Assembler')
            return 0
        }
        return this.h;
    };

    private set size(size: NdNumericArray2d) {
        if (this.pipe && this.output) {
            this.w = size[0]
            this.h = size[1]
            this.output.width = size[0]
            this.output.height = size[1]
            this.pipe.forEach(({layer}) => {
                layer.size = size
            })
        }
    }

    @alive
    export(node: Node<any>) {
        if (!this.resized) {
            this.resized = true;
            const rect = node.boundingRect
            if (rect) {
                if (this.size[0] !== rect.size[0] || this.size[1] !== rect.size[1]) {
                    this.size = [rect.size[0], rect.size[1]]
                    this.cast('resize', new NdStateEvent<NdNodeAssembler>(this, null))
                }
            }
        }
        if (!this._ready) {
            this.output!.context.clearRect(0, 0, this.w, this.h)
            this.pipe!.forEach((v) => {
                if (this.output) v.layer.draw(this.output.context)
            })
            this._ready = true;
            this.cast('update', new NdStateEvent<NdNodeAssembler>(this, null))
        }
        return this.output!.element
    }

    @alive
    resize() {
        this.resized = false;
        this._ready = false;
    };


}