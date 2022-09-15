import {NdDestructibleEventScheme, NdNodePointerPredicate} from '../Nodes/@types/types';
import Node from '../Nodes/Node';
import NdModBase from '../Nodes/models/NdModBase';
import NdDestroyableNode from "../Nodes/classes/NdDestroyableNode";

export default class NdMouseConnector<Props extends NdModBase = NdModBase> extends NdDestroyableNode<NdDestructibleEventScheme<NdMouseConnector>> {
    private _disabled: boolean = false
    test: NdNodePointerPredicate
    private emit: Node<Props>['cast']

    constructor(
        emitter: Node<Props>['cast'],
        tester: NdNodePointerPredicate) {
        super()
        this.test = tester
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

    destroy(): undefined {
        super.destroy();
        this.test = () => false
        this.emit = () => undefined
        this._disabled = true
        return
    }

}