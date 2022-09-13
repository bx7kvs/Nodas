import Node from './Node';
import NdModBase from './models/NdModBase';
import NdNodeBox from './classes/NdNodeBox';
import {alive} from "./decorators/alive";
import Nodes from "../Nodes";
import sharedConnectorService from "../Services/SharedConnectorService";
import SharedConnectorService from "../Services/SharedConnectorService";
import {NDB} from "../Services/NodasDebug";
import NdNodeConnector from "./classes/NdNodeConnector";

export default class Group extends Node<NdModBase> {
    protected Box: NdNodeBox
    render: (context: CanvasRenderingContext2D, date: Date, frame: number) => CanvasRenderingContext2D
    append: (node: Node<any> | Node<any>[]) => Group
    prepend: (node: Node<any> | Node<any>[]) => Group
    remove: (node: Node<any>) => Group
    forEachChild: (cb: (e: Node<any>) => void) => Group

    private appendChild(node: Node<any> | Node<any>[], connector?: NdNodeConnector, prepend: boolean = false) {
        if (node instanceof Array) {
            node.forEach(v => {
                this.appendChild(v, connector, prepend)
            })
        } else {
            if (connector) {
                if (!Nodes.treeViolation(this, node)) {
                    const childConnector = sharedConnectorService.connector(node)
                    if (childConnector) {
                        if (childConnector.parent !== this) {
                            if (childConnector.parent) childConnector.parent.remove(node)
                            node.attach(this.app!)
                            childConnector.parent = this
                            connector.zChild(node, node.z, prepend)
                            this.Box.purge()
                            this.matrixContainer.purge()
                            NDB.positive(`Child ${node.id} appended to ${this.id}`)
                        } else NDB.positive(`Node ${node.id} already child of Group ${this.id}. Ignored`)
                    } else throw new Error(`Appending unregistered Node ${node.id} into ${this.id}. Possibly ${node.id} has been destroyed previously`)
                } else throw new Error(`Tree integrity violation. Appending ${node.id} into ${this.id} caused tree shortcut.`)
            } else throw new Error(`Appending to unregistered Group ${this.id}`)
        }
    }

    constructor(id: string) {
        super(id, new NdModBase());
        let connector = SharedConnectorService.connector(this)
        this.Box = new NdNodeBox(this, this.cache, () => {
            if (connector) {
                let minX = Infinity,
                    minY = Infinity,
                    maxY = -Infinity,
                    maxX = -Infinity

                connector!.forEachChild((e) => {
                    const box = e.box
                    if (box) {
                        minX = Math.min(minX, box.position[0])
                        minY = Math.min(minY, box.position[1])
                        maxX = Math.max(maxX, box.position[0] + box.size[0])
                        maxY = Math.max(maxY, box.position[1] + box.size[1])
                    }
                })

                if (!isFinite(minX)) minX = 0;
                if (!isFinite(maxX)) maxX = 0;
                if (!isFinite(minY)) minY = 0;
                if (!isFinite(maxY)) maxY = 0;

                return [
                    minX + this.data!.position.get()[0],
                    minY + this.data!.position.get()[1],
                    maxX - minX,
                    maxY - minY,
                    0, 0, 0, 0
                ]
            }
            return [0, 0, 0, 0, 0, 0, 0, 0]
        });
        this.render = (context: CanvasRenderingContext2D, date: Date, frame: number) => {
            if (connector) {
                Node.transformContext(this, context)
                connector.forEachChild((e) => {
                    this.app!.nodes.compile(e, context, date, frame)
                })
            }
            return context
        }
        this.append = (node: Node<any> | Node<any>[]) => {
            this.appendChild(node, connector, false)
            return this
        }
        this.prepend = (node: Node<any> | Node<any>[]) => {
            this.appendChild(node, connector, true)
            return this
        }
        this.remove = (node) => {
            if (connector) {
                connector.removeChild(node, node.z)
                const childConnector = sharedConnectorService.connector(node)
                if (childConnector) {
                    childConnector.parent = null
                    NDB.positive(`Child ${node.id} removed from ${this.id}`)
                }
            } else throw new Error(`Removing child ${node.id} from unregistered Group ${this.id}`)
            return this
        }
        this.forEachChild = (cb) => {
            if (connector) {
                connector.forEachChild(cb)
            } else throw new Error(`Iterating through children of unregistered Group ${this.id}`)
            return this
        }
        this.once('destroyed', () => connector = undefined)
    }


    @alive
    export() {
        const canvas = document.createElement('canvas'),
            context = canvas.getContext('2d')
        canvas.width = this.box!.size[0]
        canvas.height = this.box!.size[1]
        this.render(context!, new Date(), 0)
        return canvas
    }

    protected test: Node<NdModBase>['test'] = () => false

}