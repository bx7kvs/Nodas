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

    private treeViolation(target: Group, node: Node<any>): boolean {
        if (target === node) return true
        return target.parent ? this.treeViolation(target.parent, target) : false
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
                    if (this._root.node) {
                        this.append(this._root.node, connector.id)
                    } else NDB.error(`Application root lost. Not root group node to append to`)
                } else NDB.warn(`Node ${connector.id} already exists. Ignored.`)
            }
            node.once('destroyed', () => this.unregister(node))
        }
    }

    unregister(node: Node<any>) {
        if (this.ids.has(node.id)) {
            this.unmount(node)
            delete this.nodes[node.id]
            this.ids.delete(node.id)
            NDB.positive(`Node ${node.id} unregistered`)
        }
    }

    unmount(node: Node<any>) {
        if (this.nodes[node.id].connector.parent) {
            const parent = this.nodes[node.id].connector.parent
            if (parent) this.nodes[parent.id].connector.removeChild(node, node.z)
        }
        this.nodes[node.id].connector.parent = null
        if (node == this._root.node) {
            this._root = {}
            NDB.warn('Unmounting root group.')
        }
        NDB.positive(`Node ${node.id} unmounted`)
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
                    this.nodes[newId].connector.id = newId
                    delete this.nodes[id]
                }
                NDB.warn(`Can not rename node ${id}. Another node with id ${newId} already exists`)
            } else NDB.warn('Unable to rename destroyed node. Ignored')
        }
        NDB.warn(`Attempt to rename non existing node ${id}`)
    }

    z(node: Node<any>, z: number) {
        if (this.ids.has(node.id)) {
            if (!this.nodes[node.id].node.destroyed) {
                if (this.nodes[node.id]) {

                    const parent = this.nodes[node.id].connector.parent
                    if (parent) this.nodes[parent.id].connector.zChild(node, z)

                }
                this.nodes[node.id].connector.z = z
            } else NDB.warn('Can not change z of a destroyed node. Ignored')
        }
    }

    get(id: string):Node<any> {
        return this.nodes[id].node
    }

    get root(){
        return this._root.node
    }

    append(target: Group, id: string, prepend: boolean = false) {
        if (!target.destroyed) {
            if (this.ids.has(target.id) && this.ids.has(id)) {
                if (!this.nodes[id].node.destroyed) {
                    if (!this.treeViolation(target, this.nodes[id].node)) {
                        if (this.nodes[id].connector.parent) {
                            const parent = <Node<any>>this.nodes[id].connector.parent
                            this.nodes[parent.id].connector.removeChild(this.nodes[id].node, this.nodes[id].connector.z)
                        }
                        this.nodes[target.id].connector.zChild(this.nodes[id].node, this.nodes[id].connector.z, prepend)
                        this.nodes[id].connector.parent = target
                        NDB.positive(`Node ${id} appended to ${target.id}`)
                    } else NDB.warn(`Node tree violation. Appending node ${id} to itself or it's child. `)
                } else NDB.warn(`Appending destroyed node. Ignored`)
            } else NDB.warn(`Manipulating non registered node ${id} or ${target.id}.`)
        } else NDB.warn(`Appending to a destroyed group. Ignored`)

    }
}