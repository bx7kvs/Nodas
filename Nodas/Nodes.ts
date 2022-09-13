import Group from './Nodes/Group';
import NdNodeConnector from './Nodes/classes/NdNodeConnector';
import {NdCanvasContext} from './@types/types';
import Canvas from './Canvas';
import Node from './Nodes/Node'
import {NDB} from './Services/NodasDebug';

export default class Nodes {
    private _root: {
        node?: Group,
        connector?: NdNodeConnector
    } = {}
    private clear = false
    private ids = new Set<string>()
    private nodes: {
        [key: string]: {
            node: Node<any>
            connector: NdNodeConnector
        }
    } = {}

    private drawNodeTree: (context: NdCanvasContext, date: Date, frame: number) => void = (context, date, frame) => {
        if (!this._root.node || !context) return;
        if (this.clear) context.clearRect(0, 0, context.canvas.offsetWidth, context.canvas.offsetHeight);
        this.compile(this._root.node, context, date, frame)
    }

    constructor(Canvas: Canvas) {
        Canvas.queue(0, this.drawNodeTree)
    }



    register(node: Node<any>, connector: NdNodeConnector) {
        if (!node.destroyed) {
            if (!this._root.node) {
                if (node instanceof Group) {
                    const root = {
                        node: node as Group,
                        connector: connector
                    }
                    this._root = root;
                    this.ids.add(root.connector.id)
                    this.nodes[connector.id] = root
                    NDB.positive(`Node ${connector.id} registered`)
                } else throw new Error('Root node must be a Group instance')
            } else {
                if (!this.ids.has(connector.id)) {
                    this.ids.add(connector.id)
                    this.nodes[connector.id] = {node: node, connector: connector}
                } else throw new Error(`Node ${connector.id} already exists. Ignored.`)
            }
        }
    }

    unregister(node: Node<any>) {
        if (this.ids.has(node.id)) {
            delete this.nodes[node.id]
            this.ids.delete(node.id)
            if(this._root && this._root.node === node) {
                NDB.warn('Unregistering root group')
                this._root = {}
            }
            NDB.positive(`Node ${node.id} unregistered. ID ${node.id} is free to use.`)
        }
    }

    compile(node: Node<any>, context: CanvasRenderingContext2D, date: Date, frame: number) {
        if (this.nodes[node.id] && this.nodes[node.id].node === node) {
            if (!this.nodes[node.id].node.destroyed) {
                context.save()
                this.nodes[node.id].connector.render(context, date, frame)
                context.restore()
            } else NDB.warn('Attempt to compile a destroyed node. Ignored')
        } else NDB.error(`Attempt to render unmounted node ${node.id}`)
    }

    rename(id: string, newId: string) {
        if (this.ids.has(id)) {
            if (!this.nodes[id].node.destroyed) {
                if (!this.ids.has(newId)) {
                    this.nodes[newId] = this.nodes[id]
                    this.ids.add(newId)
                    this.ids.delete(id)
                    delete this.nodes[id]
                }
                NDB.warn(`Can not rename node ${id}. Another node with id ${newId} already exists`)
            } else NDB.warn('Unable to rename destroyed node. Ignored')
        }
        NDB.warn(`Attempt to rename non existing node ${id}`)
    }

    get(id: string):Node<any> {
        return this.nodes[id].node
    }

    get root() {
        return this._root.node
    }

    static treeViolation(target: Group, node: Node<any>): boolean {
        if (target === node) return true
        return target.parent ? this.treeViolation(target.parent, target) : false
    }
}