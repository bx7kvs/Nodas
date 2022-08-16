import {NdNumericArray2d} from '../../@types/types';
import NdCanvas from '../../classes/NdCanvas';
import Node from '../Node';
import NdLayer from '../../classes/NdLayer';
import NdEmitter from '../../classes/NdEmitter';

type AssemblerLayerConfig = {
    name: string,
    resolver: ConstructorParameters<typeof NdLayer>[0]
}
type ReflectAssemblerUpdate<T extends AssemblerLayerConfig[], K extends number = keyof T & number> = (name?: T[K]['name']) => void

export default class NdModeAssembler extends NdEmitter<{ [key in 'resize' | 'update']: undefined }> {
    private output = new NdCanvas()
    private pipe: { order: number, layer: NdLayer }[] = []
    private readonly layers: { [key: string]: NdLayer }
    private w = 0
    private h = 0
    private resized = false
    private _ready = false;
    public update: ReflectAssemblerUpdate<AssemblerLayerConfig[]>

    constructor(
        layers: AssemblerLayerConfig[]
    ) {
        super()
        this.layers =
            Object.fromEntries(
                layers.map((value, key) => {
                    const layer = new NdLayer(value.resolver)
                    this.pipe.push({
                        order: key,
                        layer: layer
                    })
                    return [value.name, layer]
                })) as { [key: string]: NdLayer }


        this.pipe.sort((a, b) => a.order - b.order)
        this.update =  (name) => {
            if (name) {
                if (this.layers[name]) {
                    this._ready = false;
                    this.layers[name].update();
                }
            } else {
                Object.values(this.layers).forEach((v) => {
                    v.update()
                })
            }

        }
    }

    get ready() {
        return this._ready
    }

    get size() {
        return [this.w, this.h]
    }

    get width() {
        return this.w;
    };

    get height() {
        return this.h;
    };

    private set size(size: NdNumericArray2d) {
        this.w = size[0]
        this.h = size[1]
        this.output.width = size[0]
        this.output.height = size[1]
        this.pipe.forEach(({layer}) => {
            layer.size = size
        })
    }

    export(element: Node<any>) {
        if (!this.resized) {
            this.resized = true;
            if(this.size[0] !== element.boundingRect.size[0] || this.size[1] !== element.boundingRect.size[1]) {
                this.size = [element.boundingRect.size[0], element.boundingRect.size[1]]
                this.cast('resize', undefined)
            }
        }
        if (!this._ready) {
            this.output.context.clearRect(0, 0, this.w, this.h)
            this.pipe.forEach((v) => {
                v.layer.draw(this.output.context)
            })
            this._ready = true;
            this.cast('update', undefined)
        }

        return this.output.element
    }

    resize() {
        this.resized = false;
        this._ready = false;
    };


}