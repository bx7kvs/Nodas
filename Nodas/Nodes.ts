import Group from './Nodes/Group';
import NdNodeConnector from './Nodes/classes/NdNodeConnector';
import {NdCanvasContext, NdMainDrawingPipeF} from './@types/types';
import Canvas from './Canvas';
import Node from './Nodes/Node'
import {NDB} from './Services/NodasDebug';

export default class Nodes {
    private _root: {
        element?: Group,
        render?: NdMainDrawingPipeF
        connector?: NdNodeConnector
    } = {}
    private clear = false
    private ids = new Set<string>()
    private elements: {
        [key: string]: {
            element: Node<any>
            render: NdMainDrawingPipeF,
            connector: NdNodeConnector
        }
    } = {}

    private drawNodeTree: (context: NdCanvasContext, date: Date, frame: number) => void = (context, date, frame) => {
        if (!this._root.element || !context) return;
        if (this.clear) context.clearRect(0, 0, context.canvas.offsetWidth, context.canvas.offsetHeight);
        this.compile(this._root.element, context, date, frame)
    }

    constructor(Canvas: Canvas) {
        Canvas.queue(0, this.drawNodeTree)
    }

    private treeViolation(target: Group, element: Node<any>): boolean {
        if (target === element) return true
        return target.parent ? this.treeViolation(target.parent, target) : false
    }

    register(id: string, element: Node<any>, render:NdMainDrawingPipeF) {
        if (!this._root.element) {
            if (element instanceof Group) {
                const root = {
                    element: element as Group,
                    render: render,
                    connector: new NdNodeConnector(id, this)
                }
                this._root = root;
                this.ids.add(root.connector.id)
                this.elements[id] = root
                NDB.positive(`Element ${id} registered`)
            } else throw new Error('Root element must be a Group instance')
        } else {
            if (!this.ids.has(id)) {
                this.ids.add(id)
                this.elements[id] = {element: element, render: render, connector: new NdNodeConnector(id, this)}
                if (this._root.element) {
                    this.append(this._root.element, id)
                } else NDB.error(`Application root lost. Not root group node to append to`)
            } else NDB.warn(`Node ${id} already exists. Ignored.`)
        }
        return this.elements[id].connector
    }

    unregister(element: Node<any>) {
        if (this.ids.has(element.id)) {
            this.unmount(element)
            delete this.elements[element.id]
            this.ids.delete(element.id)
            NDB.positive(`Node ${element.id} unregistered`)
        }
    }

    unmount(element: Node<any>) {
        if (this.elements[element.id].connector.parent) {
            const parent = this.elements[element.id].connector.parent
            if (parent) this.elements[parent.id].connector.removeChild(element, element.z)
        }
        this.elements[element.id].connector.parent = null
        if (element == this._root.element) {
            this._root = {}
            NDB.warn('Unmounting root group.')
        }
        NDB.positive(`Node ${element.id} unmounted`)
    }

    compile(element: Node<any>, context: CanvasRenderingContext2D, date: Date, frame: number) {
        if (this.elements[element.id] && this.elements[element.id].element === element) {
            context.save()
            this.elements[element.id].render(context, date, frame)
            context.restore()
        } else NDB.error(`Attempt to render unmounted node ${element.id}`)
    }

    rename(id: string, newId: string) {
        if (this.ids.has(id)) {
            if (!this.ids.has(newId)) {
                this.elements[newId] = this.elements[id]
                this.ids.add(newId)
                this.ids.delete(id)
                this.elements[newId].connector.id = newId
                delete this.elements[id]
            } NDB.warn(`Can not rename node ${id}. Another node with id ${newId} already exists`)
        } NDB.warn(`Attempt to rename non existing node ${id}`)
    }

    z(element: Node<any>, z: number) {
        if (this.ids.has(element.id)) {
            if (this.elements[element.id]) {
                const parent = this.elements[element.id].connector.parent
                if (parent) this.elements[parent.id].connector.zChild(element, z)
            }
            this.elements[element.id].connector.z = z
        }
    }

    get(id: string) {
        return this.elements[id].element
    }

    get root() {
        return this._root.element
    }

    append(target: Group, id:string, prepend: boolean = false) {
        if (this.ids.has(target.id) && this.ids.has(id)) {
            if (!this.treeViolation(target, this.elements[id].element)) {
                if(this.elements[id].connector.parent) {
                    const parent = <Node<any>>this.elements[id].connector.parent
                    this.elements[parent.id].connector.removeChild(this.elements[id].element, this.elements[id].connector.z)
                }
                this.elements[target.id].connector.zChild(this.elements[id].element, this.elements[id].connector.z, prepend)
                this.elements[id].connector.parent = target
                NDB.positive(`Node ${id} appended to ${target.id}`)
            } else  NDB.warn(`Node tree violation. Appending node ${id} to itself or it's child. `)
        } else NDB.warn(`Manipulating non registered node ${id} or ${target.id}.`)
    }
}