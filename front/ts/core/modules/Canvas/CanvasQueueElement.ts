import {ReflectCanvasQueueCallback} from "./types";

export default class CanvasQueueElement {
    readonly order:number = 0
    readonly callback;
    constructor(callback:ReflectCanvasQueueCallback, order?:number) {
        if (!callback.name) throw new Error('Unable to enqueue callback. Provide a named function.');
        this.callback = callback
        if(order) this.order = order
    }
}