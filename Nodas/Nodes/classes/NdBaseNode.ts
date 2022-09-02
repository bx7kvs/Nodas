import NdNodeBox from "./NdNodeBox";
import NdDestroyableNode from "./NdDestroyableNode";
import NdStateEvent from "../../classes/NdStateEvent";
import {alive} from "../decorators/alive";

export default abstract class NdBaseNode<Scheme extends { destroy: NdStateEvent<NdBaseNode<Scheme>>, destroyed: NdStateEvent<NdBaseNode<Scheme>> }, K extends keyof Scheme = keyof Scheme> extends NdDestroyableNode<Scheme> {
    protected abstract Box?: NdNodeBox

    constructor() {
        super();
        this.once('destroyed', () => {
            this.Box = undefined
        })
    }

    @alive
    get box() {
        if (this.Box) {
            return this.Box.value.container
        }

    }

    @alive
    get boundingRect() {
        if (this.Box) {
            return this.Box.value.sprite
        }
    }
}