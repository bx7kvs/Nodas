import {NdNodePointerPredicate, NdNodePointerTransformF} from '../Nodes/@types/types';
import Node from '../Nodes/Node';
import NdModBase from '../Nodes/models/NdModBase';

export default class NdNodeMouseDispatcher<Props extends NdModBase = NdModBase> {
    private _disabled: boolean = false
    public readonly test: NdNodePointerPredicate
    public readonly transform?: NdNodePointerTransformF
    private emit: Node<Props>['cast']

    constructor(
        emitter: Node<Props>['cast'],
        tester: NdNodePointerPredicate,
        transformer?: NdNodePointerTransformF) {
        this.test = tester
        this.transform = transformer
        this.emit = emitter
    }

    cast(event: Parameters<Node<Props>['cast']>[0], data: Parameters<Node<Props>['cast']>[1]): ReturnType<Node<Props>['cast']> | false {
        return !this.disabled ? this.emit(event, data) : false
    }


    get disabled() {
        return this._disabled
    }

    disable() {
        this._disabled = true
    }

    enable() {
        this._disabled = false
    }
}