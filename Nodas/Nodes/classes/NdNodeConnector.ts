import Node from '../Node';
import Group from '../Group';
import Nodes from '../../Nodes';
import NdStateEvent from "../../classes/NdStateEvent";
import NdDestroyableNode from "./NdDestroyableNode";

export default class NdNodeConnector extends NdDestroyableNode<{ destroy: NdStateEvent<NdNodeConnector>, destroyed: NdStateEvent<NdNodeConnector> }> {
    private _parent: Group | null = null
    private layers: { [key: number]: Node<any>[] } = {}
    private layer: number = 0;
    private identifier: string;
    readonly tree: Nodes

    zChild(node: Node<any>, z: number, prepend?: boolean) {
        if (!this.layers[z]) this.layers[z] = []
        prepend ? this.layers[z].unshift(node) : this.layers[z].push(node)
    }

    removeChild(node: Node<any>, z: number) {
        this.layers[z] = this.layers[z].filter(v => v !== node)
        if (!this.layers[z].length) delete this.layers[z]
    }

    constructor(id: string, tree: Nodes) {
        super()
        this.identifier = id;
        this.tree = tree
        this.once('destroyed', () => {
            this.layers = {}
            this.parent = null
        })
    }

    get z() {
        return this.layer
    }

    set z(value) {
        this.layer = value
    }

    get parent() {
        return this._parent
    }

    set parent(value: Group | null) {
        this._parent = value
    }

    set id(id: string) {
        this.identifier = id
    }

    get id(): string {
        return this.identifier
    }

    forEachLayer(callback: (e: Node<any>, index: number, layer: number) => void) {
        for (let layer in this.layers) {
            this.layers[layer].forEach((e, index) => {
                callback(e, index, parseInt(layer))
            })
        }
    }
}