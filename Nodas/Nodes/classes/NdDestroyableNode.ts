import NdEmitter from "../../classes/NdEmitter";
import {alive} from "../decorators/alive";
import NdDestroyEvent from "../../classes/NdDestroyEvent";
import {NdDestructibleEventScheme} from "../@types/types";


export default class NdDestroyableNode<Scheme extends NdDestructibleEventScheme<NdDestroyableNode<Scheme>>> extends NdEmitter<Scheme> {
    private _destroyed: boolean = false

    constructor() {
        super();
    }

    get destroyed() {
        return this._destroyed
    }

    @alive
    destroy(): undefined {
        this.cast('destroy', new NdDestroyEvent(this) as Scheme['destroy'])
        this._destroyed = true
        this.cast('destroyed', new NdDestroyEvent(this) as Scheme['destroyed'])
        this.removeAllListeners()
        return
    }
}