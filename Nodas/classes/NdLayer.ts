import {NdNumericArray2d} from '../@types/types';
import {NdAssemblerContextResolver, NdDestructibleEventScheme} from '../Nodes/@types/types';
import NdCanvas from './NdCanvas';
import NdDestroyableNode from "../Nodes/classes/NdDestroyableNode";
import {alive} from "../Nodes/decorators/alive";

export default class NdLayer extends NdDestroyableNode<NdDestructibleEventScheme<NdLayer>> {
    private canvas? = new NdCanvas;
    private width = 0;
    private height = 0;
    private f?: NdAssemblerContextResolver = undefined;
    private ready = false;
    private ordering = 0;

    constructor(resolver: NdAssemblerContextResolver) {
        super()
        this.f = resolver.bind(this)
        this.once('destroyed', () => {
            this.canvas = this.canvas!.destroy()
            this.f = undefined
        })
    }

    @alive
    draw(context: CanvasRenderingContext2D) {
        if (!this.ready) {
            if (this.canvas!.context) {
                this.canvas!.context.save();
                this.canvas!.context.clearRect(0, 0, this.width, this.height);
                if (this.f) this.f(this.canvas!.context);
                this.canvas!.context.restore();
                this.ready = true;
            }
        }
        context.drawImage(this.canvas!.element, 0, 0);
    }

    @alive
    get resolver() {
        return this.f;
    }

    @alive
    get size() {
        return [this.width, this.height]
    }

    set size([width, height]: NdNumericArray2d) {
        if (width !== this.width || height !== this.height) {
            this.canvas!.width = width
            this.canvas!.height = height
            this.ready = false
            this.width = width
            this.height = height
        }
    }

    @alive
    get order() {
        return this.ordering
    }

    set order(order: number) {
        this.ordering = order
    }

    @alive
    update() {
        this.ready = false
    }
}