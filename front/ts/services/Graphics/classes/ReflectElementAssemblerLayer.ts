import {ReflectPointArray2d} from "../../../@types/types";
import {ReflectAssemblerContextResolver} from "../@types/types";
import Canvas from "./Canvas";

export default class ReflectElementAssemblerLayer {
    private canvas = new Canvas;
    private width = 0;
    private height = 0;
    private f: ReflectAssemblerContextResolver | null = null;
    private ready = false;
    private ordering = 0;

    public draw(context: CanvasRenderingContext2D) {
        if (!this.ready) {
            if (this.canvas.context) {
                this.canvas.context.clearRect(0, 0, this.width, this.height);
                this.canvas.context.save();
                if (this.f) this.f(context);
                this.ready = true;
                context.restore();
            }
        }
        context.drawImage(this.canvas.element, 0, 0);
    }

    get resolver() {
        return this.f;
    }

    set resolver(resolver) {
        this.f = resolver
    }


    get size() {
        return [this.width, this.height]
    }
    set size([width,height]:ReflectPointArray2d) {
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