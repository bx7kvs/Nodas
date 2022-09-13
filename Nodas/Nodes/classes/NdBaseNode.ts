import NdNodeBox from "./NdNodeBox";
import NdDestroyableNode from "./NdDestroyableNode";
import {alive} from "../decorators/alive";
import {NdDestructibleEventScheme} from "../@types/types";

export default abstract class NdBaseNode<Scheme extends NdDestructibleEventScheme<NdBaseNode<Scheme>>, K extends keyof Scheme = keyof Scheme> extends NdDestroyableNode<Scheme> {
    protected abstract Box?: NdNodeBox

    protected constructor() {
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