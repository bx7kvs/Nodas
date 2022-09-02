import NdEmitter from "../../classes/NdEmitter";
import {alive} from "../decorators/alive";
import NdStateEvent from "../../classes/NdStateEvent";


export default class NdDestroyableNode<Scheme extends { destroy: NdStateEvent<NdDestroyableNode<Scheme>>, destroyed:NdStateEvent<NdDestroyableNode<Scheme>> }> extends NdEmitter<Scheme> {
    private _destroyed: boolean = false

    constructor() {
        super();
    }
    get destroyed() {
        return this._destroyed
    }
    @alive
    destroy():undefined {
        this.cast('destroy', new NdStateEvent(this, null) as Scheme['destroy'])
        this._destroyed = true
        this.cast('destroyed', new NdStateEvent(this, null) as Scheme['destroyed'])
        this.removeAllListeners()
        return
    }
}