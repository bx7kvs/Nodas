import Node from './Node';
import NdModBase from './models/NdModBase';
import NdNodeBox from './classes/NdNodeBox';
import Nodas from '../../Nodas';
import {alive} from "./decorators/alive";

export default class Group extends Node<NdModBase> {
    append: (node: Node<any> | Node<any>[]) => Group
    protected render: Node<NdModBase>['render']
    protected Box: NdNodeBox = new NdNodeBox(this, this.cache, () => {
        let minX = Infinity,
            minY = Infinity,
            maxY = -Infinity,
            maxX = -Infinity

        this.treeConnector!.forEachChild((e) => {
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
    });

    constructor(id: string, app: Nodas) {
        super(id, new NdModBase(), app);
        this.render = (context, date, frame) => {
            if (!this.destroyed) {
                Node.transformContext(this, context)
                this.treeConnector!.forEachChild((e) => {
                    app.nodes.compile(e, context, date, frame)
                })
            } else throw new Error('Attempt to render destroyed Group')
            return context
        }
        this.append = (node: Node<any> | Node<any>[]) => {
            if (node instanceof Array) {
                node.forEach(v => {
                    app.nodes.append(this, v.id)
                })
            } else {
                app.nodes.append(this, node.id)
            }
            return this
        }
    }

    @alive
    export() {
    }

    @alive
    forEachChild(cb: (e: Node<any>) => void) {
        this.treeConnector!.forEachChild(cb)
    }

    protected test: Node<NdModBase>['test'] = () => false

}