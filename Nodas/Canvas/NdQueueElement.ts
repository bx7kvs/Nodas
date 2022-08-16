import {NdCanvasQueueCallback} from '../@types/types';

export default class NdQueueElement {
    readonly order: number = 0
    readonly callback;

    constructor(callback: NdCanvasQueueCallback, order?: number) {
        this.callback = callback
        if (order) this.order = order
    }
}