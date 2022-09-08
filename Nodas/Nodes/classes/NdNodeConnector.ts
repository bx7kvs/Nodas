import Node from '../Node';
import Group from '../Group';
import {NdMainDrawingPipeF} from "../../@types/types";

export default class NdNodeConnector {
    private _parent: Group | null = null
    private layers: { [key: number]: Node<any>[] } = {}
    private layer: number = 0;
    private identifier: string;
    render: NdMainDrawingPipeF

    zChild(node: Node<any>, z: number, prepend?: boolean) {
        if (!this.layers[z]) this.layers[z] = []
        prepend ? this.layers[z].unshift(node) : this.layers[z].push(node)
    }

    removeChild(node: Node<any>, z: number) {
        this.layers[z] = this.layers[z].filter(v => v !== node)
        if (!this.layers[z].length) delete this.layers[z]
    }

    constructor(id: string, render: NdMainDrawingPipeF) {
        this.identifier = id;
        this.render = render
    }

    reset() {
        this.layers = {}
        this._parent = null
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

    forEachChild(callback: (e: Node<any>, index: number, layer: number) => void) {
        for (let layer in this.layers) {
            this.layers[layer].forEach((e, index) => {
                callback(e, index, parseInt(layer))
            })
        }
    }
}