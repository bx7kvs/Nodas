import {NdNumericArray2d} from '../@types/types';
import {NdAssemblerContextResolver} from '../Nodes/@types/types';
import NdCanvas from './NdCanvas';

export default class NdLayer {
    private canvas = new NdCanvas;
    private width = 0;
    private height = 0;
    private f: NdAssemblerContextResolver | null = null;
    private ready = false;
    private ordering = 0;

    constructor(resolver: NdAssemblerContextResolver) {
        this.f = resolver.bind(this)
    }

    public draw(context: CanvasRenderingContext2D) {
        if (!this.ready) {
            if (this.canvas.context) {
                this.canvas.context.save();
                this.canvas.context.clearRect(0, 0, this.width, this.height);
                if (this.f) this.f(this.canvas.context);
                this.canvas.context.restore();
                this.ready = true;
            }
        }
        context.drawImage(this.canvas.element, 0, 0);
    }

    get resolver() {
        return this.f;
    }


    get size() {
        return [this.width, this.height]
    }

    set size([width, height]: NdNumericArray2d) {
        if (width !== this.width || height !== this.height) {
            this.canvas.width = width
            this.canvas.height = height
            this.ready = false
            this.width = width
            this.height = height
        }
    }

    get order() {
        return this.ordering
    }

    set order(order: number) {
        this.ordering = order
    }

    update() {
        this.ready = false
    }
}