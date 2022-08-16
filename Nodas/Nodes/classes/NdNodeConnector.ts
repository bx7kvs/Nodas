import Node from '../Node';
import Group from '../Group';
import Nodes from '../../Nodes';

export default class NdNodeConnector {
    private _parent: Group | null = null
    private _layers: { [key: number]: Node<any>[] } = {}
    private _layer: number = 0;
    private _identifier: string;
    readonly tree: Nodes

    constructor(id: string, tree: Nodes) {
        this._identifier = id;
        this.tree = tree
    }

    get z() {
        return this._layer
    }

    set z(value) {
        this._layer = value
    }

    get parent() {
        return this._parent
    }

    set parent(value: Group | null) {
        this._parent = value
    }

    set id(id: string) {
        this._identifier = id
    }

    get id(): string {
        return this._identifier
    }

    forEachLayer(callback: (e: Node<any>, index: number, layer: number) => void) {
        for (let layer in this._layers) {
            this._layers[layer].forEach((e, index) => {
                callback(e, index, parseInt(layer))
            })
        }
    }

    zChild(element: Node<any>, z: number, prepend?: boolean) {
        if (!this._layers[z]) this._layers[z] = []
        prepend ? this._layers[z].unshift(element) : this._layers[z].push(element)
    }

    removeChild(element: Node<any>, z:number) {
        this._layers[z] = this._layers[z].filter(v => v !== element)
        if(!this._layers[z].length) delete this._layers[z]
    }
}